---
name: mrt-deep-dive-analysis
description: Deep-dive phân tích từng layer của material-react-table setup — state machine, theme integration, row mechanics, settings reconciliation, failure modes, extension points.
metadata:
  type: research
---

# Deep-Dive: Material React Table Setup — Landsoft-One-Web

> Báo cáo bổ sung cho `research-260812-mrt-setup-audit.md`. Tập trung vào **state lifecycle, theme internals, row mechanics, reconciliation logic, edge cases** chưa cover ở báo cáo trước.

---

## A. Settings State Machine — Toàn bộ Lifecycle

### A.1. 3 tầng state tách biệt

```
┌──────────────────────────────────────────────────────────────────────┐
│ Layer 1: localStorage (persisted)                                    │
│   Key: landsoft:admin-table-prefs:{tableId}                          │
│   Value: { version: number, data: T }                                │
│   Owner: useAdminTablePrefs (read in useEffect, write on setPrefs)   │
└──────────────────────────────────────────────────────────────────────┘
              │
              │ on mount (after hydration)
              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Layer 2: applied (source of truth for table render)                 │
│   Owner: useAdminTablePrefs.prefs                                    │
│   Mutated by: setPrefs (commit) / patchApplied (live, e.g. resize)  │
│   Consumed by: useEmployeesTable.state.*, build*ColumnPinning, etc. │
└──────────────────────────────────────────────────────────────────────┘
              │
              │ on sheet open (syncDraftFromApplied)
              │ on PATCH
              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Layer 3: draft (working copy inside settings sheet)                 │
│   Owner: useReducer in useAdminTableSettings                         │
│   Mutated by: patchDraft (any control in sheet)                      │
│   Committed to Layer 2 via: apply() → setPrefs(draft)                │
└──────────────────────────────────────────────────────────────────────┘
```

### A.2. State Transitions — Từng Event Flow

**Mount + hydration** (`use-admin-table-prefs.ts:56-74`):
```
1. useState(defaultValue) → render default
2. useEffect runs after first paint
3. localStorage.getItem(key) → if exists:
     a. JSON.parse
     b. version check (drop if mismatch)
     c. reconcileRef.current(stored) → filter orphan ids, append new
     d. setPrefsState(data)
4. setIsHydrated(true)
```

> **Critical:** Bước 3 chạy TRONG effect → đã commit default render trước. Đây là lý do callers phải guard `settings.isHydrated` (Employees làm đúng ở `employees-list-screen.tsx:373`).

**Patch (live updates — resize, toggle switches via MRT)**:
- Resize column: `useEmployeesTable` gọi `onColumnSizingChange` → `employees-list-screen.tsx:222-237` → `settings.patchApplied({ columnSizing })` → write localStorage + update applied
- **Bỏ qua draft** vì không qua sheet → applied + localStorage sync ngay.

**Open sheet** (`admin-table-settings.tsx:54-65`):
```
1. openSheet() → settingsHook.syncDraftFromApplied()
   → dispatch HYDRATE { payload: cloneSettings(applied) }
2. setOpen(true)
3. Sheet renders với draft = applied clone
```

> **Race condition guard:** Nếu user resize column (patchApplied) TRONG KHI sheet đang mở, draft vẫn là snapshot cũ → user phải đóng/mở lại sheet để thấy. Đây là acceptable cho UX hiện tại (sheet modal không cho phép interact với table).

**Patch draft (bất kỳ control nào trong sheet)**:
```
1. SettingsSwitchRow onChange → patchDraft({ showMultiRowSelection: value })
2. dispatch PATCH { payload: partial }
3. reducer: cloneSettings({ ...state, ...payload })
   → spread + array clone (pinLeft, pinRight, hiddenColumnIds, columnOrder)
   → object clone (columnSizing)
4. Sheet re-renders với draft mới
5. hasPendingChanges = !deepEqualSettings(draft, applied)
6. activeChangeCount = countNonDefault(draft)
```

**Apply** (`admin-table-settings.tsx:67-71`):
```
1. handleApply() → onBeforeApply?.(draft, applied)
   - Employees: check enableInfiniteScroll changed → setFiltersParams({ pageNumber: 1 })
2. settingsHook.apply() → setPrefs(cloneSettings(draft))
3. setOpen(false)
4. localStorage.setItem(key, JSON.stringify({ version, data: next }))
5. Table re-render với state.columnOrder/Visibility/Sizing/Pinning mới
```

**Clear** (`use-admin-table-settings.ts:81-85`):
```
1. resetPrefs() → localStorage.removeItem(key) + setPrefsState(defaultValue)
2. dispatch CLEAR { payload: defaultValue() }
3. Draft = default, applied = default
```

### A.3. Reconciliation — Tại sao quan trọng

File `products-table-settings.ts:71-88` và `employees-table-settings.ts:121-138`:

**Vấn đề:** User lưu prefs khi có 8 columns. Sau đó dev thêm column mới (schema version bump + code update). Stored prefs có `columnOrder` cũ → conflict với column mới.

**Logic reconcile:**
```ts
1. valid = Set(DATA_COLUMN_ORDER hiện tại)
2. filterIds(stored.columnOrder) → drop ids không còn trong valid
3. orderKnown = Set(filtered)
4. appended = DATA_COLUMN_ORDER.filter(id => !orderKnown.has(id)) → columns mới
5. columnOrder = [...filtered, ...appended] → append columns mới vào cuối
6. hiddenColumnIds, pinLeft, pinRight: filterIds only (drop orphans)
7. columnSizing: Object.fromEntries(filter)
```

**Version mismatch:** Nếu `parsed.version !== current.version` → drop stored entirely, dùng default. → **Forces clean state khi schema breaking change.** Dev bump version trong screen (`tableId: "products-list", version: 1`).

**Employees có thêm 1 field:** `enableInfiniteScroll` (`reconcile` line 129):
```ts
enableInfiniteScroll: stored.enableInfiniteScroll ?? true,
```
→ Default true cho old prefs (backward compat).

### A.4. Patch Applied vs Patch Draft — Khi nào dùng cái nào

| Action | Hook | Reason |
|--------|------|--------|
| Column resize (drag handle) | `patchApplied` | Persist ngay, không cần vào sheet |
| Show/hide column via MRT menu | `patchApplied` | Same |
| Multi-row toggle in sheet | `patchDraft` | Chờ Apply để commit |
| Pin/unpin in sheet | `patchDraft` | Same |
| Infinite scroll toggle in sheet | `patchDraft` | Same (+ onBeforeApply reset page) |
| Clear all | `resetPrefs` (atomic) | Wipe storage + reset cả 2 layers |

**Pattern:** Mọi thay đổi qua **sheet** = draft → apply. Mọi thay đổi **inline qua MRT** = patchApplied. Tránh conflict.

---

## B. MUI Theme Integration — Tại sao tách theme + tokens

### B.1. Vấn đề cốt lõi

`mui-admin-theme.ts:8-11` ghi rõ:
> **MRT/MUI run colors through parsers that reject CSS `var(...)`.**

→ MUI palette yêu cầu literal values (hex, rgb). Không thể pass `var(--grid-bg-paper)` vào `palette.background.paper` — MUI sẽ throw hoặc silently ignore.

### B.2. Hybrid approach

| MUI cần | Source | Type |
|---------|--------|------|
| `palette.background.default` | `muiPaletteLiterals.backgroundDefault` | Literal hex |
| `palette.text.primary` | `muiPaletteLiterals.textPrimary` | Literal hex |
| `palette.primary.main` | `muiPaletteLiterals.primaryMain` | Literal hex |
| `shape.borderRadius` | `gridShape.borderRadiusPx` | Number |
| `components.MuiTableCell.borderColor` | `gridColor.border` | CSS var (allowed in sx) |
| `components.MuiPaginationItem.selected.backgroundColor` | `var(--color-primary-default)` | CSS var (in sx, OK) |

**Quy tắc:**
- `palette.*` → chỉ literals (MUI engine parse)
- `components.*.styleOverrides.sx` → CSS var OK (browser resolve)
- `muiTableBodyCellProps.sx` (per-table) → CSS var OK

### B.3. ThemeProvider scope

`admin-data-grid.tsx:39`:
```tsx
<ThemeProvider theme={adminMuiTheme}>
  <div className="...">
    {showProgressBars && <LinearProgress />}
    <MaterialReactTable table={table} {...mrtProps} />
  </div>
</ThemeProvider>
```

Theme chỉ scope trong AdminDataGrid → tránh leak sang non-grid MUI components (Modal, Sheet, etc.).

**Implication:** Nếu dev thêm MUI component NGOÀI AdminDataGrid mà muốn dùng admin style → phải wrap ThemeProvider riêng hoặc import theme. Hiện tại design OK vì admin pages tách biệt rõ ràng.

### B.4. Conflict với Tailwind

Theme set `boxShadow: "none"` cho Paper (`mui-admin-theme.ts:56`). Tailwind classes từ container (`rounded-lg`, `border`) tự render. → Visual consistency vẫn OK vì `AdminGridContainer` wrap ngoài.

**Tuy nhiên:** Nếu admin page dùng `<Dialog>` (MUI) trong theme provider → không có shadow → có thể unexpected. Cẩn thận khi compose.

---

## C. Row Mechanics — Master-Detail Selection

### C.1. 3 trạng thái row

| State | Visual | CSS Selector | Trigger |
|-------|--------|--------------|---------|
| Default | Even/odd striping | `tr` base | — |
| Hover | `gridColor.rowHover` + 2px left accent | `&:hover` | mouse enter |
| Selected (multi-row checkbox) | `gridColor.rowSelected` + 2px accent | `[data-selected="true"]` | checkbox click |
| Focused (master-detail) | `gridColor.rowFocused` + 3px left accent | `[data-focused="true"]` | row click via `getAdminGridSelectableRowProps` |

**Source:** `use-admin-table.tsx:528-568` (base) + `admin-grid-row-selection.ts:10-91` (focused variant).

### C.2. Pinned Cell Overlay — Tại sao phức tạp

**MRT default behavior:** Pinned cells dùng `box-shadow inset` để tạo "shadow on scroll" effect. Khi row scroll horizontal, box-shadow bị clip bởi container overflow.

**Override** (`use-admin-table.tsx:514-522`):
```ts
...(pinSide
  ? {
    opacity: 1,
    zIndex: pinSide === "left" ? 2 : 3,
    "&:before": {
      opacity: "1 !important",
      backgroundColor: `${gridColor.bgPaper} !important`,
    },
  }
  : { zIndex: 0 }),
```

`&:before` là pseudo-element MRT dùng để paint opaque background cho pinned cell khi scroll. Override `opacity: 1 !important` để luôn hiển thị.

**Focused + Pinned conflict** (`admin-grid-row-selection.ts:25-29`):
```ts
"& > td:first-of-type[data-pinned='true']::before": {
  backgroundColor: `${fill} !important`,  // fill = rowFocused
  opacity: "1 !important",
  boxShadow: `${accentInset} !important`,  // 3px focused accent
}
```
→ Khi pinned + focused: accent bar move từ cell sang `::before` pseudo (vì borderLeft không work trên pinned cell vì cell đã có left:0 fixed).

### C.3. Selection Click Guard

`getAdminGridSelectableRowProps.onClick` (`admin-grid-row-selection.ts:80-84`):
```ts
const target = event.target as HTMLElement;
if (target.closest("button, a, input, [role='button'], [role='checkbox']")) return;
onSelect();
```

→ Prevent row click trigger khi user click vào:
- Action buttons (3-dots menu)
- Links
- Inputs (inline edit)
- Any custom `[role='button']`
- Checkboxes (MRT row select)

**Tested:** Click vào text cell → row select. Click vào icon action → chỉ action fire, không select row.

### C.4. isFocused deprecation

`admin-grid-row-selection.ts:62-67`:
```ts
type AdminGridSelectableRowArgs = {
  isFocused?: boolean;      // ← new canonical
  isSelected?: boolean;     // ← @deprecated alias
  onSelect: () => void;
};

const focused = isFocused ?? isSelected ?? false;
```

→ Backward compat cho callers cũ. Employees/Products đã migrate sang `isFocused` (line `useEmployeesTable.tsx:410`).

---

## D. Cell Rendering — Compound Columns & Footer Aggregation

### D.1. Compound column pattern (3-cột thực thi 1 cột)

Employees có nhiều compound columns (`emails`, `phones`, `idInfo`, `bankInfo`, `created`, `updated`):

```tsx
{
  id: "emails",  // không có accessorKey vì composite
  header: d.email,
  size: 220,
  Cell: ({ row }) => (
    <div className="flex flex-col gap-0.5">
      <span className="block truncate">
        <span className="text-[11px] text-muted-foreground/80 font-normal">Công ty: </span>
        {workEmail ?? "—"}
      </span>
      <span className="block truncate">
        <span className="text-[11px] text-muted-foreground/80 font-normal">Cá nhân: </span>
        {personalEmail ?? "—"}
      </span>
    </div>
  ),
}
```

**Critical:** Cell render KHÔNG qua MRT's internal `flexRender` cho accessorKey (vì id không match). MRT vẫn render OK vì nó dựa trên column definition, không cần accessor.

**Trade-off:**
- Pro: Hiển thị 2 values trong 1 cell, tránh 2 columns riêng
- Con: Sort/filter không work vì không có accessorKey. → Phải sort manual nếu cần.

### D.2. Footer Aggregation

Products (`use-products-table.tsx:112-121, 133-142`):
```tsx
{
  accessorKey: "area",
  ...,
  ...(showSummaryFooter
    ? {
        Footer: ({ table }) => {
          const total = table
            .getFilteredRowModel()
            .rows.reduce((sum, row) => sum + (row.getValue<number>("area") ?? 0), 0);
          return <span className="text-xs font-bold">{formatArea(total)}</span>;
        },
      }
    : {}),
}
```

**Key insight:** `table.getFilteredRowModel()` — total chỉ cho FILTERED rows, không phải toàn dataset.

**Use case Products:**
- User filter `area >= 50` → footer chỉ sum filtered
- User pin status = "available" → footer sum chỉ available
- → Real-time aggregation theo filter, hữu ích cho sales dashboard

**Edge case:** Nếu filter là server-side (`manualFiltering: true`) → `getFilteredRowModel` trả về rows hiện tại trong `data` (đã filter). → Footer sum chỉ current page, không phải toàn bộ filtered dataset.

**Hiện tại Products KHÔNG enable `manualFiltering`** → client-side filter → footer sum chính xác.

### D.3. Footer Cell Styling Override

`use-admin-table.tsx:576-592` set bg slate-100 cho TẤT CẢ footer cells. → Khi `showSummaryFooter: false` → footer cells rỗng nhưng vẫn có bg slate-100 → wasted visual.

**Trade-off:** Style cố định cho mọi table. Nếu table không dùng summary → vẫn có footer row trống với bg slate.

**Verify:** `enableBottomToolbar: false` ở `use-admin-table.tsx:348` → MRT vẫn render footer row của table (separate from bottom toolbar). Footer row luôn có, chỉ nội dung cells thay đổi.

---

## E. Infinite Scroll — Toàn bộ Mechanics

### E.1. 2 queries chạy song song, chỉ 1 active

`use-employees-list-data.ts:55-56`:
```ts
const paginated = useEmployeesList(apiParams, { enabled: !enableInfinite });
const infinite = useEmployeesInfiniteList(apiParams, { enabled: enableInfinite });
```

TanStack Query tự skip query khi `enabled: false` → không fire HTTP request.

**Hydration window:**
- Pre-hydration: `enableInfinite = false` → paginated fire, infinite idle
- Post-hydration (nếu user saved `enableInfinite: true`): paginated disable, infinite enable → **wasted paginated fetch** lần đầu

**Mitigation hiện tại:** Caller guard `isHydrated` → screen render chỉ sau hydrate → first user-visible fetch = correct mode.

### E.2. Scroll-to-Top on Filter Change

`employees-list-screen.tsx:185-201`:
```ts
useEffect(() => {
  if (!enableInfinite) return;
  try {
    rowVirtualizerRef.current?.scrollToIndex?.(0);
  } catch (error) {
    console.error("scrollToIndex failed", error);
  }
}, [
  enableInfinite,
  searchKeyword,
  organizationId,
  // ... 5 filter deps
]);
```

**Critical:** Khi filter change ở infinite mode → scroll về top (row index 0). Nếu không → user scroll xuống page 5, apply filter mới, vẫn ở scroll position cũ → rows trống + confused.

**Trade-off:** Scroll snap có thể "janky" trên mobile. `try/catch` chỉ log error → fail silent nếu virtualizer chưa ready.

### E.3. fetchMoreOnBottomReached Threshold

`employees-list-screen.tsx:177-180`:
```ts
const { scrollHeight, scrollTop, clientHeight } = el;
if (scrollHeight - scrollTop - clientHeight < 400) {
  infinite.fetchNextPage();
}
```

**400px threshold** = "trigger khi còn cách bottom 400px". User vẫn scroll được xuống mượt trong khi next page fetch.

**Edge case:** Nếu page size = 10 rows × 32px = 320px → user phải scroll gần hết mới trigger. Tăng page size → fetch sớm hơn.

**Hard-coded:** Threshold không configurable qua tokens. Nếu table density thay đổi (compact → spacious) → threshold có thể quá nhỏ/lớn.

### E.4. Progress Bar vs Skeleton

Infinite mode KHÔNG dùng skeleton (`use-admin-table.tsx` không set `showSkeletons` cho infinite). Thay vào đó:

- **Fetching next page:** `AdminDataGrid` LinearProgress overlay top (`admin-data-grid.tsx:47-61`)
- **Initial load:** MRT default behavior (depends on `isLoading`)

`employees-list-screen.tsx:378`:
```tsx
<AdminDataGrid
  table={table}
  showProgressBars={infinite?.isFetchingNextPage}
  ...
/>
```

→ User thấy progress bar mỏng ở top khi scroll → load page tiếp. Initial load không có indicator (chỉ empty table).

**Risk:** Nếu `infinite` initial load chậm → user thấy empty table không rõ tại sao. Có thể cải thiện bằng `showProgressBars={infinite?.isLoading || infinite?.isFetchingNextPage}`.

---

## F. URL State vs Settings State — Khi nào dùng cái nào

### F.1. Phân biệt

| State | Persistence | Owner | Examples |
|-------|-------------|-------|----------|
| **URL** (filters, search, pagination, selectedId) | Browser URL → shareable | `useURLState` | `?pageNumber=2&isActive=true&selectedId=123` |
| **Settings** (column layout, widths, pins) | localStorage → per-device | `useAdminTableSettings` | column order, width, pin left/right |
| **Zustand** (UI state, ephemeral) | In-memory, route-scoped | `useTabsNavUiStore` | `detailCollapsed` |
| **Server** (data, mutations) | DB → shared across users | TanStack Query | employee list, mutations |

### F.2. Settings → URL sync (cross-mode)

`employees-list-screen.tsx:125-132`:
```ts
const handleTableSettingsBeforeApply = useCallback(
  (draft, applied) => {
    if (draft.enableInfiniteScroll !== applied.enableInfiniteScroll) {
      setFiltersParams({ pageNumber: 1 });
    }
  },
  [setFiltersParams],
);
```

→ Khi user toggle infinite scroll → reset URL `pageNumber` về 1. Lý do: infinite mode không có page concept, paginated mode dùng page.

**Risk:** Nếu user toggle ở page 5 → apply → URL có `?pageNumber=1` (đúng) nhưng screen chỉ reset sau re-render. Có thể flash `pageNumber=5` 1 frame trước khi sync.

### F.3. Settings → Data fetch (cross-system)

`employees-list-screen.tsx:121-123`:
```ts
const enableInfinite = settings.isHydrated
  ? settings.applied.enableInfiniteScroll
  : false;
```

→ Settings quyết định query mode (paginated vs infinite). Không có "transition state" giữa 2 mode → swap tức thì sau hydrate.

**Trade-off:** User có 2 query definitions chạy nhưng chỉ 1 enabled tại 1 thời điểm. Code đơn giản nhưng cache riêng biệt → toggle mode = fresh fetch (không reuse cache).

---

## G. Drag & Drop — dnd-kit Integration

### G.1. Setup

`column-layout-list.tsx:78-82`:
```ts
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
);
```

**Distance 4:** Click+drag phải > 4px mới trigger reorder. Tránh accidental drag khi click.

**Keyboard:** Space/Enter để pick up, arrows để move, Space/Enter để drop. A11y compliant.

### G.2. Strategy

`verticalListSortingStrategy` — vertical reordering cho list items.

`arrayMove(order, oldIndex, newIndex)` — pure function từ dnd-kit.

### G.3. Sortable Row Mechanics

`sortable-column-row.tsx:51-84`:
```ts
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
  id: columnId,
});

// Drag handle CHỉ ở grip icon button (không phải cả row)
<button {...attributes} {...listeners}>
  <GripVertical />
</button>
```

→ User drag bằng cách grab grip icon. Click vào row text/checkbox KHÔNG trigger drag.

**A11y:** `attributes` chứa `aria-roledescription`, `tabIndex`, `aria-pressed`. dnd-kit handle focus management.

### G.4. Visual States

- `isDragging` → `relative z-10 bg-muted/60 shadow-sm` → row lifted
- `isHidden` → `opacity-50` → visual cue column này đang ẩn
- `hover:bg-muted/50` → standard hover

---

## H. i18n — Localization Strategy

### H.1. Locale switching

`useEmployeesTable.tsx:81-82`:
```ts
const localization =
  locale === "en" ? MRT_Localization_EN : MRT_Localization_VI;
```

`MRT_Localization_VI` từ `material-react-table/locales/vi`. Built-in locale.

### H.2. Custom labels

Mọi label trong Settings sheet qua i18n keys (`AdminTableSettingsLabels`):
- `title`, `trigger`, `behavior`, `multiRowSelection`, `summaryFooter`, `infiniteScroll`
- `pinLeft`, `pinRight`, `locked`, `columnLayout`
- `colStt`, `colName`, `columnWidth`, `dragColumn`, `resetColumnLayout`, `columnVisibility`

Build qua `buildEmployeesTableSettingsLabels(d)` (`employees-table-settings.ts:228-249`).

### H.3. Dictionary keys (VI/EN)

Pattern: `dict.system.employees.tableSettings*`. Mỗi module tự define keys của mình trong `src/lib/i18n/dictionaries/{vi,en}/`.

**Critical rule (theo CLAUDE.md):** Thêm key mới → update C� `vi` và `en` trong cùng change. Nếu chỉ 1 → fallback hoặc missing key bug.

### H.4. Locale-aware formatting

`admin-pagination-bottom-toolbar.tsx:16-20`:
```ts
const fmt = (n: number) => n.toLocaleString(locale === "vi" ? "vi-VN" : "en-US");
```

→ `1,234` (en) vs `1.234` (vi). Currency `formatVND` cũng locale-aware.

`use-admin-table.tsx:836-841`:
```ts
const formattedFetched = totalFetched.toLocaleString(locale === "vi" ? "vi-VN" : "en-US");
```

### H.5. i18n gap

`use-employees-table.tsx:135-138, 214-218, 271-273, 290-293, 335-337, 354-356`:
```tsx
<span className="text-[11px] text-muted-foreground/80 font-normal">Công ty: </span>
```

→ **Hard-coded Vietnamese!** Labels "Công ty", "Cá nhân", "Loại", "Số", "Tên", "Ngân hàng", "Lúc", "Bởi" không qua i18n.

**Risk:** Nếu user chuyển sang EN locale → vẫn thấy Vietnamese sub-labels trong cells. Inconsistency.

**Migration:** Thêm keys vào dictionary, replace literal strings.

---

## I. Edge Cases & Failure Modes

### I.1. localStorage quota exceeded

`use-admin-table-prefs.ts:79-86`:
```ts
try {
  window.localStorage.setItem(...);
} catch {
  // Ignore write failures (quota / disabled storage).
}
```

→ Silent fail. User vẫn dùng được nhưng settings không persist qua reload.

**Better UX:** Show toast "Settings không lưu được — kiểm tra dung lượng browser". Hiện tại không có feedback.

### I.2. Corrupt JSON in localStorage

`use-admin-table-prefs.ts:68-70`:
```ts
} catch {
  // Quota disabled / corrupt JSON / private mode — fall back to defaults.
}
```

→ Falls back to defaults. Settings reset silently. User mất custom layout không rõ lý do.

### I.3. Version mismatch

`use-admin-table-prefs.ts:61`:
```ts
if (parsed.version === version) {
  const data = reconcileRef.current ? reconcileRef.current(parsed.data) : parsed.data;
  setPrefsState(data);
}
```

→ Version mismatch → drop stored entirely, dùng default. User mất settings hoàn toàn.

**Migration:** Nếu schema thay đổi breaking → bump `version` + provide `reconcile` fn để migrate. Nếu bump version mà không reconcile → user mất settings.

### I.4. Infinite scroll: race condition trên rapid filter change

Scenario:
1. User type "John" vào search → fetch page 1
2. User delete → "J" → fetch page 1 mới
3. Cả 2 response về, MRT merge vào virtualizer

**Issue:** Nếu response 1 về sau response 2 → virtualizer hiển thị data cũ 1 frame rồi swap.

`use-employees-list-data.ts:60`:
```ts
return infinite.data?.pages.flatMap((p) => p.items) ?? [];
```

→ Flat all pages. TanStack Query đã cancel stale request? **Cần verify** behavior của `useEmployeesInfiniteList`.

### I.5. Settings conflict: columnSizing từ 2 nguồn

1. Resize trên table → `onColumnSizingChange` → `patchApplied({ columnSizing })`
2. Sheet width input → `onColumnSizingChange(sizing)` → `patchDraft({ columnSizing })`

**Conflict:** Nếu user resize ở table RỒI mở sheet mà chưa sync draft → draft có sizing cũ, applied có sizing mới.

**Mitigation:** `openSheet` call `syncDraftFromApplied` (`admin-table-settings.tsx:54-57`) → draft = clone applied → no conflict khi mở sheet.

**Residual risk:** Nếu user resize ở table TRONG KHI sheet đang mở → applied mới, draft cũ. User apply → ghi đè applied mới bằng draft cũ → lost work.

### I.6. Memory leak: ref giữ reconcile fn

`use-admin-table-prefs.ts:53-54`:
```ts
const reconcileRef = useRef(reconcile);
reconcileRef.current = reconcile;
```

→ Update mỗi render. OK nhưng nếu `reconcile` closure capture stale state → migrate bug.

### I.7. SSR: window undefined

`use-admin-table-prefs.ts:58`:
```ts
const raw = window.localStorage.getItem(storageKey(tableId));
```

→ Trong `useEffect` → chỉ chạy client-side. SSR safe.

### I.8. Drag drop trên row chứa pinned column

Scenario: User pin "code" left → row trong `columnOrder` có "code" ở đầu. Khi user drag "code" trong sheet → `arrayMove` update `columnOrder`.

`buildEmployeesMrtColumnOrder` (line 188-193):
```ts
const leading = showMultiRowSelection
  ? ["mrt-row-select", "mrt-row-numbers"]
  : ["mrt-row-numbers"];
return [...leading, ...settings.columnOrder, "mrt-row-actions"];
```

→ User có thể reorder "code" trong `columnOrder` mà KHÔNG ảnh hưởng pin (pin xử lý riêng qua `pinLeftColumns`).

**Verify:** Pin = column nào đứng yên trái/phải khi scroll. Order = thứ tự hiển thị. 2 concept tách biệt. → No conflict.

### I.9. MRT Column ID conflicts

`mrt-row-select`, `mrt-row-numbers`, `mrt-row-actions` — reserved IDs của MRT. Nếu data column có `id: "mrt-row-actions"` → conflict → render sai.

**Mitigation:** Module settings reconcile filter theo `DATA_COLUMN_ORDER` valid set. Reserved IDs không bao giờ nằm trong user arrays.

---

## J. Performance Analysis

### J.1. Re-render triggers

| Operation | Re-renders | Heavy? |
|-----------|------------|--------|
| Filter change | Screen + useEmployeesTable + MRT internal | Medium |
| Page change | Same | Medium |
| Column resize | useAdminTable (sx rebuild) + MRT state | Low |
| Settings draft patch | useReducer → AdminTableSettingsSheet only | Low |
| Settings apply | Screen + useEmployeesTable (state.column*) | Medium |
| Locale switch | useT → all `dict.*` consumers | High |

### J.2. Memo opportunities

**Đã memo:**
- `columns` useMemo trong `useEmployeesTable` (`use-employees-table.tsx:103-378`) — deps `[d, sc, locale]`
- `tableSettingsLabels`, `layoutColumns`, `lockedColumns` ở screen level
- `effectiveColumnPinning` useMemo
- `build*ColumnSizing/Visibility/Order` rebuild mỗi table render (pure functions, OK)

**Có thể memo thêm (nhưng YAGNI):**
- `mrtProps` ở `AdminDataGrid` — re-create mỗi render nhưng shallow

### J.3. Bundle impact

MRT + MUI + dependencies:
- `@mui/material`: ~300KB gzipped (full)
- `material-react-table`: ~150KB gzipped
- `@dnd-kit/core + sortable`: ~30KB gzipped
- `@tanstack/react-table`: bundled với MRT

→ Admin pages load ~500KB grid stack. Đã acceptable cho admin (non-critical for marketing pages).

**Optimization:** Dynamic import `AdminDataGrid` cho non-list admin screens (forms, detail). Hiện tại eager load.

### J.4. Virtualization cost

Khi `mode: "infinite"` → `enableRowVirtualization: true`. MRT dùng `@tanstack/react-virtual` (TanStack Virtual).

- Overscan: 8 rows
- Row height: 32px fixed
- → DOM chỉ render ~30 rows visible + 16 buffer = 46 rows. → Constant memory regardless of dataset size.

**Critical:** Row height PHẢI fixed để virtualizer hoạt động đúng. Employees/Products không có row height dynamic → OK.

### J.5. Infinite scroll memory growth

`useEmployeesInfiniteList` accumulate pages in TanStack Query cache. 100 pages × 20 rows = 2000 rows trong memory.

**Risk:** User scroll 100 pages → 2000 rows trong React tree → re-render cost tăng. MRT chỉ render visible → DOM OK, nhưng React state size tăng.

**Mitigation:** Backend pagination giới hạn total pages, hoặc LRU evict cache (TanStack Query option).

---

## K. Extension Patterns

### K.1. Thêm module mới dùng AdminDataGrid

```ts
// 1. Define settings type (employees-table-settings.ts pattern)
export type MyModuleTableSettings = {
  showMultiRowSelection: boolean;
  showSummaryFooter: boolean;
  pinLeftColumns: string[];
  pinRightColumns: string[];
  hiddenColumnIds: string[];
  columnOrder: string[];
  columnSizing: Record<string, number>;
};

// 2. Define DATA_COLUMN_ORDER + DEFAULT_COLUMN_SIZING + DEFAULT_PIN_LEFT + DEFAULT_HIDDEN
// 3. Implement: defaultMyModuleTableSettings, cloneMyModuleTableSettings,
//    buildMyModuleColumnVisibility, buildMyModuleMrtColumnOrder, buildMyModuleColumnPinning,
//    reconcileMyModuleTableSettings, myModuleTableSettingsEqual,
//    countNonDefaultMyModuleTableSettings, buildMyModuleDefaults,
//    buildMyModuleTableSettingsLabels, buildMyModuleLayoutColumns, buildMyModuleLockedColumns
// 4. Build useMyModuleTable hook using useAdminTable
// 5. Compose screen với useAdminTableSettings + AdminTableSettings
```

→ Boilerplate ~300 LOC per module. Có thể extract generic factory nếu ≥3 modules.

### K.2. Custom MRT column type (compound, badge, footer aggregate)

Reference `use-employees-table.tsx` lines 124-143 (compound), 306-323 (badge), `use-products-table.tsx` lines 112-142 (footer aggregate).

### K.3. Custom row action

Reference `use-employees-table.tsx:427-455` (3 actions, conditional REACTIVATE vs DEACTIVATE).

### K.4. Server-side filter/sort (advanced)

Hiện tại MRT chỉ có `manualPagination: true`. Nếu cần server-side sort/filter:
1. `manualSorting: true` + `onSortingChange` → setFiltersParams
2. `manualFiltering: true` + `onColumnFiltersChange` → setFiltersParams
3. Backend hỗ trợ `sortBy`, `sortOrder`, `filter[col]=value`

→ CHƯA làm. Tất cả sort/filter hiện tại = client-side.

### K.5. Infinite + heavyGrid

Hiện tại KHÔNG combine (`use-admin-table.tsx:181`):
> KHÔNG combine với `heavyGrid` (infinite đã tự bật virtualization).

→ Infinite đã handle virtualization. `heavyGrid` chỉ dùng khi dataset < threshold nhưng vẫn muốn virtualization.

---

## L. Verification Anchors (Deep-Dive)

| Claim | Source |
|-------|--------|
| 3-layer state model | `use-admin-table-prefs.ts:26-100`, `use-admin-table-settings.ts:46-106` |
| Reconciliation appends new columns | `products-table-settings.ts:75-78`, `employees-table-settings.ts:124-127` |
| `enableInfiniteScroll` default fallback | `employees-table-settings.ts:129` |
| MUI palette needs literals (no CSS var) | `mui-admin-theme.ts:8-23` |
| Pinned cell `&:before` override | `use-admin-table.tsx:514-522`, `admin-grid-row-selection.ts:22-43` |
| `isFocused` is canonical, `isSelected` deprecated | `admin-grid-row-selection.ts:62-77` |
| Row click guard against interactive elements | `admin-grid-row-selection.ts:80-84` |
| Footer sums FILTERED rows | `use-products-table.tsx:115-117` |
| Two queries, one enabled | `use-employees-list-data.ts:55-56` |
| 400px scroll threshold | `employees-list-screen.tsx:177-180` |
| `try/catch` silent on localStorage fail | `use-admin-table-prefs.ts:68-70, 84-86` |
| Drag distance 4px threshold | `column-layout-list.tsx:79` |
| Drag handle is ONLY grip icon | `sortable-column-row.tsx:75-83` |
| Hard-coded Vietnamese labels (gap) | `use-employees-table.tsx:135, 215, 271, 290, 335, 354` |
| `onBeforeApply` reset page on infinite toggle | `employees-list-screen.tsx:125-132` |
| `openSheet` syncs draft from applied | `admin-table-settings.tsx:54-65` |

---

## M. Open Questions (Deep-Dive)

1. **Hard-coded VI labels trong compound cells** — Có migrate sang i18n keys? Scope bao nhiêu (employees only hay all modules)?
2. **Local storage silent fail** — UX có cần feedback khi quota exceeded không?
3. **Drag conflict với sticky row actions** — Drag handle có overlap với actions column không? (`sortable-column-row.tsx` không reference `mrt-row-actions`)
4. **Settings `onBeforeApply` race** — Apply settings + reset URL có atomic transaction không?
5. **Footer aggregation với manualFiltering** — Khi switch sang server-side filter, footer sum có còn đúng không?
6. **TanStack Query cache strategy cho infinite** — Có cần LRU evict cho pages cũ?
7. **Compound columns sort** — Hiện tại không sort được. Có workaround (sort manual trong Cell)?

---

## N. Summary — Architectural Strengths & Weaknesses

### Strengths

1. **Single source of truth** cho visual config (`admin-grid-tokens.ts`) → thay đổi 1 chỗ, propagate toàn bộ admin grids
2. **3-layer state** tách bạch (URL / settings / data) → clean separation
3. **Reconciliation** robust — schema evolution không break user prefs
4. **i18n-first** localization qua MRT built-in + custom labels
5. **SSR-safe** hydration pattern đúng chuẩn (default → effect → hydrate)
6. **Master-detail** �n định — focused/selected/hover rõ ràng, accent bar chuyên nghiệp
7. **Infinite scroll** opt-in qua settings, không ép buộc
8. **A11y** đầy đủ (keyboard, aria, role descriptions)

### Weaknesses

1. **Density toggle no-op** — UI affordance không có effect
2. **Products legacy settings hook** — UX inconsistency với Employees
3. **Hard-coded VI labels** — i18n gap trong compound cells
4. **`mergeMuiRowProps` shallow merge** — caller nested sx có thể bị overwrite
5. **Drag handle conflict potential** với sticky actions column (chưa tested)
6. **Silent failure** trên localStorage quota/corrupt — UX không rõ ràng
7. **Infinite threshold hard-coded** (400px) — không adaptive
8. **Footer aggregation local-only** — không scale với manualFiltering
9. **Compound columns không sort** — workaround cần manual Cell sort
10. **No compound columns for badge groups** — nếu cell cần 3+ values, pattern chưa có

---

**Report completed.** Tổng cộng 14 sections (A-N) deep-dive vào internals của MRT setup. Combined với báo cáo audit trước → full picture của MRT integration trong Landsoft-One-Web.

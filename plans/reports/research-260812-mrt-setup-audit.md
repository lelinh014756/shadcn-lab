---
name: mrt-setup-ux-ui-audit
description: Phân tích toàn bộ setup UX/UI của material-react-table (MRT) trong Landsoft-One-Web — từ shared hook, settings sheet, master-detail screen, tokens, đến column-level config.
metadata:
  type: research
---

# Báo cáo: Toàn bộ Setup UX/UI của Material React Table (MRT) — Landsoft-One-Web

> Scope: `employees-list`, `products-list` (2 reference implementations), shared hook `useAdminTable`, settings sheet, design tokens, AdminDataGrid wrapper.
> Method: Read source trực tiếp + cross-reference với MRT docs (v2/v3).

---

## 1. Tổng quan kiến trúc

Landsoft-One-Web không dùng MRT raw — toàn bộ pages wrap qua 3 lớp:

```
┌─────────────────────────────────────────────────────────────────┐
│ Screen (employees-list / products-list)                         │
│   - Compose: useAdminTableSettings + useEmployeesListData       │
│   - Toolbar / filters / master-detail orchestration             │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────�
│ useEmployeesTable / useProductsTable (per-module hooks)         │
│   - Columns definition (MRT_ColumnDef)                          │
│   - Table-level options: enableRowSelection, enableStickyFooter │
│   - renderRowActions                                            │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ useAdminTable (src/lib/hooks/use-admin-table.tsx)               │
│   - Shared MRT config: density, layout, pagination, theme       │
│   - Cell/Row/Header sx tokens                                   │
│   - Infinite + heavyGrid mode                                   │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ AdminDataGrid (src/components/data-display/admin-data-grid.tsx)│
│   - MUI ThemeProvider                                            │
│   - Renders <MaterialReactTable />                               │
└─────────────────────────────────────────────────────────────────┘
```

**Files liên quan:**
- Shared hook: `src/lib/hooks/use-admin-table.tsx`
- Grid wrapper: `src/components/data-display/admin-data-grid.tsx`
- Settings sheet: `src/components/data-display/admin-table-settings/admin-table-settings.tsx`, `admin-table-settings-sheet.tsx`
- Settings hook: `src/components/data-display/admin-table-settings/use-admin-table-settings.ts`
- Tokens: `src/lib/configs/admin-grid-tokens.ts`
- Theme: `src/lib/configs/mui-admin-theme.ts`

---

## 2. UX/UI Features của MRT — Setup chi tiết

### 2.1. Layout & Density

| Feature | Setup | Source |
|---------|-------|--------|
| `layoutMode` | `"grid"` (horizontal padding) | `use-admin-table.tsx:350` |
| `initialState.density` | `"compact"` | `use-admin-table.tsx:359` |
| Font size | 12px (Inter) | `admin-grid-tokens.ts:8-12` |
| Cell padding | `4px 12px` (overrides compact) | `admin-grid-tokens.ts:74-77`, `gridCellPaddingSx:96-98` |
| Row min-height | 32px | `admin-grid-tokens.ts:79` |
| Header height | 32px (fixed) | `admin-grid-tokens.ts:81` |

**Trade-off:** `!important` overrides trong `gridCellPaddingSx` đảm bảo consistency nhưng block user thay density qua toolbar (vì `enableDensityToggle: true` không thực sự thay đổi padding).

### 2.2. Toolbar Configuration

| Toggle | Status | Source |
|--------|--------|--------|
| `enableTopToolbar` | **false** | `use-admin-table.tsx:351` |
| `enableToolbarInternalActions` | **false** | `use-admin-table.tsx:349` |
| `enableBottomToolbar` | depends on mode (paginated: true) | `use-employees-table.tsx:390` |
| `enableColumnActions` | **false** | `use-admin-table.tsx:338` |
| `enableColumnFilters` | **true** | `use-admin-table.tsx:339` |
| `enableColumnPinning` | **true** | `use-admin-table.tsx:340` |
| `enableColumnResizing` | **true** | `use-admin-table.tsx:341` |
| `enableDensityToggle` | **true** (no-op do sx !important) | `use-admin-table.tsx:342` |
| `enableFullScreenToggle` | **true** | `use-admin-table.tsx:343` |
| `enableGlobalFilter` | **true** | `use-admin-table.tsx:344` |
| `enableHiding` | **true** (column visibility menu) | `use-admin-table.tsx:345` |
| `enableRowActions` | **true** | `use-admin-table.tsx:346` |
| `enableStickyHeader` | **true** | `use-admin-table.tsx:347` |
| `paginationDisplayMode` | `"pages"` | `use-admin-table.tsx:354` |

**External toolbar:** Vì `enableTopToolbar: false`, screen tự compose toolbar (`AppToolBar`, `AppToolBarFilters`, `AppToolBarActions` từ `src/components/layout/`). Đây là pattern nhất quán cho toàn admin pages.

**Search/Filters:** `muiSearchTextFieldProps` (`use-admin-table.tsx:615-632`) và `muiFilterTextFieldProps` (`634-661`) — height 28px, font 12px, nhỏ gọn.

### 2.3. Column Display Defaults

```ts
displayColumnDefOptions = {
  "mrt-row-actions": {
    grow: false,
    minSize: 112,
    size: 120,  // 3×24px buttons + 2×8px gaps + padding
    muiTableBodyCellProps: { align: "center", overflow: "visible", ... },
    muiTableHeadCellProps: { align: "center", overflow: "visible", ... },
  },
  "mrt-row-numbers": { muiTableBodyCellProps: { align: "center" } },
  "mrt-row-select":  { muiTableBodyCellProps: { align: "center" } },
}
```

Source: `use-admin-table.tsx:462-500`. Kích thước actions column tính tay (3×24+2×8=88 + padding 12×2=112), KHÔNG dùng auto-fit.

**Lưu ý:** `positionActionsColumn: "last"` (`use-admin-table.tsx:352`) → luôn pin-right.

### 2.4. Cell & Header Styling

**Body cell** (`use-admin-table.tsx:502-526`):
- Font 12px, lineHeight 1, whiteSpace nowrap
- Border-bottom 1px
- Pin handling: opacity 1, zIndex 2 (left) / 3 (right), `&:before` pseudo overlay để giữ background khi scroll horizontal

**Header cell** (`use-admin-table.tsx:667-748`):
- Centered, font 12px, weight 600, lineHeight 1.25
- Fixed height 32px
- Sort label: `width: auto`, `flex: 0 0 auto`, `marginLeft: 0` — chống flex-grow kéo dài label
- `Mui-TableHeadCell-Content-Wrapper`: clip text (maxWidth 100%, overflow hidden)
- Pin: zIndex 4 (left) / 5 (right)

**Footer cell** (`use-admin-table.tsx:576-592`):
- Background slate-100 (#f1f5f9)
- Border-top 1px slate-300 (#cbd5e1)
- Font weight 700
- Dùng cho summary aggregation (area/price total ở Products)

### 2.5. Row Styling

**Base row** (`use-admin-table.tsx:528-568`):
- Hover: background `gridColor.rowHover` + left accent (inset shadow 2px)
- Selected (`[data-selected="true"]`): background `rowSelected` + accent 2px
- Focused (`[data-focused="true"]`): background `rowFocused` + left border 3px
- Pinned cells: dùng `&:before` pseudo thay boxShadow (tránh conflict với focus border)
- Even/odd striping từ `gridColor.rowEven/Odd`

**Selection row props:** `getAdminGridSelectableRowProps` (`src/lib/configs/admin-grid-row-selection.ts`) được apply qua `muiTableBodyRowProps` — custom onSelect, isSelected check từ `selectedRowId`.

### 2.6. Pagination & Bottom Toolbar

**Paginated mode** (`use-admin-table.tsx:392-441`):
- Page size options: `[5, 10, 20, 50]` (`admin-grid-tokens.ts:101`)
- `siblingCount: 1`, `boundaryCount: 1`
- Pagination items: 22×22px, radius 4px (`admin-grid-tokens.ts:87-88`)
- SelectProps: MenuProps disableScrollLock, paper zIndex 1500
- `SelectProps.onChange` wire page size → controlled state
- `onChange` (Pagination) wire page index → controlled state

**Infinite mode** (`use-admin-table.tsx:362-386`, `:832-873`):
- `enableRowVirtualization: true`, overscan 8
- `muiTableContainerProps.onScroll` inject `fetchMoreOnBottomReached`
- Custom bottom toolbar: progress bar + "Fetched X of Y" label
- i18n key: `dict.common.gridInfiniteFetched` (template `{fetched}` / `{total}`)

**Custom bottom toolbar (paginated):** `AdminPaginationBottomToolbar` (`src/lib/hooks/admin-pagination-bottom-toolbar.ts`).

### 2.7. Table Paper / Container

**Paper** (`use-admin-table.tsx:125-154` + `:750`):
- `elevation: 0`, border 0, borderRadius 0 (`gridShape.borderRadiusPx = 0`)
- Background `var(--grid-bg-paper)`
- `mergeTablePaperProps` merge base với page override (safe shallow merge)

**Container** (`use-admin-table.tsx:594-613`):
- height 100%, maxHeight 100%, overflow auto
- Infinite: merge `onScroll` listener giữ ref/sx từ caller

### 2.8. Column Pinning

Pattern: Screen build `effectiveColumnPinning` từ settings → truyền vào `state.columnPinning`.

**Employees** (`buildEmployeesColumnPinning` trong `src/modules/system/employees/lib/employees-table-settings.ts`):
- Left: `mrt-row-numbers`, `mrt-row-select` (nếu multi-row), data columns theo `pinLeftColumns`
- Right: `mrt-row-actions` (luôn)

**Products** (`buildProductsColumnPinning` trong `src/modules/products/lib/products-table-settings.ts`):
- Default right: `["mrt-row-actions"]` (`use-products-table.tsx:193`)
- Initial state không lock data columns — user tự pin qua Settings

**Master-detail selection:** Pinned cells dùng `&:before` pseudo overlay (`use-admin-table.tsx:514-522, 736-745`) để giữ opaque background khi table scroll horizontally.

### 2.9. Infinite Scroll Mode

Files liên quan:
- `src/modules/system/employees/hooks/use-employees-list-data.ts` — unified data fetcher
- `src/modules/system/employees/hooks/use-employees-infinite-list.ts` — query
- `useEmployeesTable` arg `mode: "paginated" | "infinite"` (`use-employees-table.tsx:53`)

**Toggle:** `settings.draft.enableInfiniteScroll` → `AdminTableSettingsSheet` switch (`admin-table-settings-sheet.tsx:135-142`) → chỉ hiển thị khi `onEnableInfiniteScrollChange !== undefined`.

**Hydration safety** (`employees-list-screen.tsx:121-123`):
```ts
const enableInfinite = settings.isHydrated
  ? settings.applied.enableInfiniteScroll
  : false;
```
Tránh double fetch (default true → switch qua query khác).

**Pagination reset:** `handleTableSettingsBeforeApply` (`employees-list-screen.tsx:125-132`) reset `pageNumber: 1` khi user toggle mode.

**Virtualizer ref** (`employees-list-screen.tsx:170`):
- `MRT_RowVirtualizer` ref để `scrollToIndex(0)` khi filter change (line 185-201)
- `fetchMoreOnBottomReached` threshold 400px (line 177-180)

### 2.10. Settings Sheet — User-Facing Config

Files:
- `admin-table-settings.tsx` (wrapper)
- `admin-table-settings-sheet.tsx` (sheet body)
- `column-layout-list.tsx` (drag & drop layout)
- `sortable-column-row.tsx` (sortable item)
- `locked-column-table.tsx` (locked display)
- `use-admin-table-settings.ts` (state machine)
- `use-admin-table-prefs.ts` (localStorage persistence)

**Sheet layout** (`admin-table-settings-sheet.tsx:97-189`):
```
┌─ AdminSheet (right, narrow) ──────────────┐
│  Header: title                            │
│  Body (flex-col, scroll):                 │
│    [Behavior]  ─ 3 switch rows            │
│      - Multi-row selection                │
│      - Summary footer                     │
│      - Infinite scroll (optional)         │
│    [Column Layout]                        │
│      - Locked left columns (info row)     │
│      - Sortable drag-and-drop list        │
│      - Locked right columns (info row)    │
│  Footer: [Clear]  [Apply]                 │
└───────────────────────────────────────────┘
```

**Switch group:** 3-col grid (`grid-cols-3 gap-2`, `admin-table-settings-sheet.tsx:122`). Mỗi switch là `SettingsSwitchRow` (line 198-227) — flex-row-reverse, label trái, switch phải.

**Drag & drop** (`column-layout-list.tsx`):
- `@dnd-kit/core` + `sortable` — PointerSensor distance 4, KeyboardSensor cho a11y
- SortableContext verticalListSortingStrategy
- Move logic: `arrayMove(order, oldIndex, newIndex)`

**Per-column row** (`sortable-column-row.tsx`):
- Drag handle (GripVertical icon)
- Column name + min/max
- Width input (number step 4)
- Pin left/right checkboxes (mutually exclusive)
- Visibility checkbox (optional)

**Locked columns** (`locked-column-table.tsx`):
- Display-only rows cho `mrt-row-numbers`, `mrt-row-select`, `mrt-row-actions`
- Không thể reorder (drag disabled)

**Reset:** `hasCustomLayout` check (`column-layout-list.tsx:90-97`) → show "Reset" button nếu có diff với defaults.

### 2.11. State Management

**Draft vs Applied** (`use-admin-table-settings.ts`):
```
draft ─PATCH/HYDRATE/CLEAR→ reducer ─cloneSettings→ state
applied ←── useAdminTablePrefs (localStorage hydrate) ──┘
```

- `draft`: working state trong sheet
- `applied`: persisted state, source of truth cho table render
- `patchApplied`: direct write (e.g. columnSizing on resize, không cần apply)
- `apply`: copy draft → applied (commit)
- `clear`: reset applied về default + clear localStorage

**Persistence:** `useAdminTablePrefs` (`src/lib/hooks/use-admin-table-prefs.ts`):
- Key: `tableId` + `version`
- `reconcile`: migrate stored shape nếu schema đổi
- SSR-safe (hydrates sau mount)

**SSR Safety Pattern** (`employees-list-screen.tsx:373`):
```tsx
{settings.isHydrated && (
  <MasterDetailLayout ... />
)}
```
Tránh render table với default state rồi re-render với localStorage → flicker.

### 2.12. Cell Rendering Patterns

**Single value** (`use-employees-table.tsx:113-122`):
```tsx
Cell: ({ cell }) => (
  <span className="block whitespace-nowrap text-xs font-semibold text-foreground">
    {cell.getValue<string>()}
  </span>
)
```

**Compound value** (`use-employees-table.tsx:130-142, 210-222, 266-278, 285-298, 330-342, 348-362`):
```tsx
Cell: ({ row }) => (
  <div className="flex flex-col gap-0.5">
    <span className="block truncate">
      <span className="text-[11px] text-muted-foreground/80 font-normal">Label: </span>
      {value ?? "—"}
    </span>
  </div>
)
```

**Badge** (`use-employees-table.tsx:306-323`):
- `EmployeeStatusBadge`, `StatusBadge` từ `@/components/data-display/`

**Footer aggregation** (`use-products-table.tsx:112-121, 133-142`):
```tsx
Footer: ({ table }) => {
  const total = table.getFilteredRowModel().rows.reduce(...);
  return <span>{formatArea(total)}</span>;
}
```
Chỉ render khi `showSummaryFooter` true.

### 2.13. Row Actions

Pattern: `renderRowActions: ({ row }) => <ButtonActions items={...} />`

**Employees** (`use-employees-table.tsx:427-455`):
- `EDIT` → `openEditModal(employee)`
- `DEACTIVATE` / `REACTIVATE` → `changeAccountStatus.mutate`
- `DELETE` → `deleteStaff.mutate(employee.id)`
- Loading state: `changeAccountStatus.isPending || deleteStaff.isPending`

**Products** (`use-products-table.tsx:203-226`):
- `EDIT` (success variant) → `onEdit?.(row.original)`
- `DELETE` (destructive variant) → `onDelete?.(row.original)`
- Wrap trong `adminPageStyles.rowActionContainerClassName`

**Master-detail pattern:**
- Row click → set selectedId (URL state)
- Detail panel re-render
- Row click prop: `getAdminGridSelectableRowProps` (`admin-grid-row-selection.ts`)

### 2.14. Empty State & Loading

**Empty rows** (`use-admin-table.tsx:414` cho Employees, không có ở Products):
```tsx
renderEmptyRowsFallback: () => <GridEmptyState title={sc.empty} />
```

**Loading** (variants):
1. **Paginated:** `state.showSkeletons: isLoading` (`use-employees-table.tsx:399`)
2. **Infinite:** `showProgressBars={infinite?.isFetchingNextPage}` trong `AdminDataGrid` (`employees-list-screen.tsx:378`) → LinearProgress overlay top
3. **Initial load Products:** `<TableSkeleton rows={8} columns={6} />` (`products-list-screen.tsx:670-674`) — chỉ khi `showGridSkeleton = isPending && items.length === 0`

### 2.15. Internationalization (i18n)

**Localization:**
```ts
const localization = locale === "en" ? MRT_Localization_EN : MRT_Localization_VI;
```
(`use-employees-table.tsx:81-82`, `use-products-table.tsx:70-71`)

**Custom labels qua Settings sheet:** `AdminTableSettingsLabels` type (`admin-table-settings-types.ts:23-40`):
- `title`, `trigger`, `behavior`, `multiRowSelection`, `summaryFooter`, `infiniteScroll`
- `pinLeft`, `pinRight`, `locked`, `columnLayout`
- `colStt`, `colName`, `columnWidth`, `dragColumn`, `resetColumnLayout`, `columnVisibility`

**Empty state key:** `dict.system.common.empty`
**Skeleton key:** `dict.common.gridInfiniteFetched` (template)

### 2.16. Accessibility (A11y)

- `ariaLabel` cho Settings trigger (`admin-table-settings-trigger.tsx:53`)
- Sort label width fix tránh flex-grow kéo lệch (`use-admin-table.tsx:719-728`)
- Progress bar aria-valuenow/min/max (`use-admin-table.tsx:850-853`)
- `KeyboardSensor` cho drag-drop (`column-layout-list.tsx:80`)
- `tooltip` text fallback từ `ariaLabel` (`admin-table-settings-trigger.tsx:31`)

---

## 3. So sánh 2 reference implementations

| Aspect | Employees | Products |
|--------|-----------|----------|
| Pagination mode | Unified (paginated + infinite) | Paginated only |
| Settings hook | `useAdminTableSettings` (newer) | `useAdminTablePrefs` (legacy) + local state |
| URL state sync | `useURLState` với `employeeFiltersSchema` | `useURLState` với `productFiltersSchema` |
| Detail panel state | `selectedId` URL | `selectedId` URL + `routeUi.detailCollapsed` (Zustand) |
| Toolbar skeleton | None | `TableSkeleton` (initial load) |
| Empty state | `GridEmptyState` (MRT fallback) | `EmptyState` page-level (no project) |
| Auto-select first row | Yes (ref guard) | Yes (ref guard + hasProject check) |
| Excel actions | Yes | Yes |
| Refresh button | `ButtonRefresh` | `AdminRefreshButton` |
| Settings trigger | `AdminTableSettings` (new) | `AdminTableSettingsSheetTrigger` (legacy split) |

**Settings hook divergence:**
- **Employees** dùng `useAdminTableSettings` (draft + applied + isHydrated API), single hook orchestrate draft lifecycle.
- **Products** dùng `useAdminTablePrefs` + manual `useState` draft (`products-list-screen.tsx:95-103`) — chưa migrate sang API mới.

→ **Inconsistency cần migrate** Products sang `useAdminTableSettings` để align UX.

---

## 4. Design Tokens (Single Source of Truth)

File: `src/lib/configs/admin-grid-tokens.ts`

| Group | Key tokens | Override behavior |
|-------|-----------|-------------------|
| `gridFont` | `size: 12, family: Inter` | Hard-coded everywhere |
| `gridColor` | CSS vars (`--grid-*`, `--color-*`) | Theme-driven |
| `gridSize` | rowMinHeight 32, cellPadding 4/12, paginationItem 22 | Fixed pixels |
| `gridShape` | `borderRadiusPx: 0` | Override MRT default |
| `gridHeaderSizing` | charWidthPx 8.5, sortIconPx 12 | Auto-calculate min column size |
| `gridCellPaddingSx` | `!important` override | Force consistent padding |
| `adminGridPaperSx()` | elevation 0, no border | Borderless paper |
| `headerLabelText()` | string extraction | Helper for size calc |
| `minColumnSizeForHeader()` | label-based min width | Auto-size on init |

**Auto-size columns** (`use-admin-table.tsx:214-232`): `withHeaderAwareColumnSizes` adjust `minSize`/`size` dựa trên header text length + sort icon width. Đảm bảo label không bị clip khi user chưa resize.

---

## 5. Trade-offs & Decision Points

### 5.1. Single `useAdminTable` vs per-module hooks

**Chosen:** `useAdminTable` (shared) + per-module `useEmployeesTable` / `useProductsTable` wrappers.

**Pro:** DRY — density, paper, header, footer style, virtualization config chỉ define một chỗ.

**Con:** Wrapper hooks phải destructure `pageOptions` (`use-admin-table.tsx:270-284`) — magic rest spread, dễ miss prop. `mergeMuiRowProps`/`mergeDisplayColumnDefOptions` phức tạp cho người mới onboard.

### 5.2. Toolbar ngoài vs `enableTopToolbar`

**Chosen:** External toolbar, `enableTopToolbar: false`.

**Pro:** UI đồng nhất với `AppToolBar` pattern across admin pages. Settings sheet trigger customize dễ.

**Con:** User mất MRT built-in actions (density toggle UI ẩn, fullscreen toggle). Density toggle set nhưng `gridCellPaddingSx !important` chặn → user toggle nhưng không thấy khác biệt. → **Bug cần fix hoặc disable**.

### 5.3. Column-level sizing override

`withHeaderAwareColumnSizes` luôn ép `minSize` ≥ header text width. Nếu user set `column.size: 90` mà header text "Description" cần 100 → size bị bump 100. → **Documented behavior**, user phải size columns ≥ header.

### 5.4. Infinite scroll hydration race

Pre-hydration: `enableInfinite = false` → paginated query fire. Post-hydration: nếu user lưu `enableInfinite: true` → switch sang infinite query, paginated bị disable. Có thể gây wasted fetch lần đầu nếu default localStorage value.

**Mitigation:** `enabled: !enableInfinite` / `enabled: enableInfinite` (`use-employees-list-data.ts:55-56`) → chỉ 1 query chạy tại 1 thời điểm.

### 5.5. Pinning background qua `&:before` pseudo

MRT dùng boxShadow inset cho pin highlight. Khi table scroll, boxShadow bị clip. `use-admin-table.tsx:514-522` override bằng `&:before { opacity: 1 !important; backgroundColor: bgPaper }` để giữ opaque background cho pinned cells.

**Trade-off:** `!important` trên `&:before` có thể conflict với future MRT updates. Pin via background hack chứ không phải proper stacking context.

### 5.6. Settings sheet: 3-col grid vs vertical list

Comment trong `admin-table-settings-sheet.tsx:114-121` justify grid (label không wrap, số lượng switch linh hoạt). Nhưng với 3+ switches trên màn hẹp → grid có thể overflow horizontal.

→ **Watch:** test trên viewport < 400px.

---

## 6. Operational Concerns

### 6.1. Bundle size
- MRT + MUI = ~250KB gzipped (significant cho admin pages)
- Lazy load `AdminDataGrid` qua dynamic import nếu page không phải list-heavy

### 6.2. Performance
- `useAdminTable` config lớn (~600 LOC) → mỗi screen render phải allocate objects mới (displayColumnDefOptions, sx). Nếu 5 tables trên 1 page → 5x re-render
- `useMemo` ở screen level (`employees-list-screen.tsx:204-220`) mitigate

### 6.3. Debugging
- Settings draft/applied separation → nếu user thấy "settings không apply" → check `isHydrated`, `reconcile` migration, localStorage key version
- Infinite scroll "không load thêm" → check `fetchMoreOnBottomReached` threshold (400px), `hasNextPage`, `isFetchingNextPage` guard

### 6.4. Backward compat
- Settings version bump cần `reconcile` fn để migrate stored shape
- Column IDs stable (`accessorKey` hoặc `id`) — KHÔNG rename nếu user đã pin

---

## 7. Risks & Migration Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| `enableDensityToggle` no-op | User confusion (toggle không có effect) | Remove toggle HOẶC drop `!important` |
| Products dùng legacy settings hook | UX inconsistency vs Employees | Migrate Products → `useAdminTableSettings` |
| Pin via `&:before !important` | Brittle nếu MRT update | Track MRT changelog; consider custom cell renderer |
| `mergeMuiRowProps` shallow merge | Nested sx arrays có thể bị overwrite last-wins | Document: caller chỉ override top-level keys |
| `useAdminTablePrefs` hydration delay | First paint flicker | Wrap trong `isHydrated` gate (Employees làm đúng, Products có thể miss) |
| Column IDs là string literals | Rename → user settings corrupt | Treat column IDs như public API |
| Infinite scroll scroll listener threshold cố định (400px) | Không adaptive cho screen nhỏ | Parametrize trong tokens |

---

## 8. Files liên quan (Quick Reference)

### Core MRT setup
- `src/lib/hooks/use-admin-table.tsx` — Shared hook (~880 LOC), infinite + heavyGrid config
- `src/lib/hooks/use-admin-table-prefs.ts` — localStorage persistence
- `src/components/data-display/admin-data-grid.tsx` — MRT wrapper với MUI theme
- `src/lib/configs/admin-grid-tokens.ts` — Design tokens (single source of truth)
- `src/lib/configs/mui-admin-theme.ts` — MUI theme override
- `src/lib/configs/admin-grid-row-selection.ts` — Row selection props
- `src/lib/configs/admin-grid-fill-layout.ts` — `adminGridFillTableProps` (Products dùng)
- `src/lib/hooks/admin-pagination-bottom-toolbar.ts` — Custom bottom toolbar

### Settings UI
- `src/components/data-display/admin-table-settings/admin-table-settings.tsx` — Wrapper component
- `src/components/data-display/admin-table-settings/admin-table-settings-sheet.tsx` — Sheet body
- `src/components/data-display/admin-table-settings/admin-table-settings-trigger.tsx` — Toolbar trigger
- `src/components/data-display/admin-table-settings/column-layout-list.tsx` — Drag-drop list
- `src/components/data-display/admin-table-settings/sortable-column-row.tsx` — Sortable item
- `src/components/data-display/admin-table-settings/locked-column-table.tsx` — Locked display
- `src/components/data-display/admin-table-settings/use-admin-table-settings.ts` — Draft state
- `src/components/data-display/admin-table-settings/admin-table-settings-types.ts` — Types
- `src/components/data-display/admin-table-settings/clone-settings.ts` — Deep clone
- `src/components/data-display/admin-table-settings/deep-equal-settings.ts` — Diff check

### Per-module implementations
- `src/modules/system/employees/screens/employees-list-screen.tsx` — Master-detail w/ infinite
- `src/modules/system/employees/hooks/use-employees-table.tsx` — Columns + actions
- `src/modules/system/employees/hooks/use-employees-list-data.ts` — Unified data fetcher
- `src/modules/system/employees/hooks/use-employees-infinite-list.ts` — Infinite query
- `src/modules/system/employees/lib/employees-table-settings.ts` — Settings shape + builders
- `src/modules/products/screens/products-list-screen.tsx` — Master-detail paginated
- `src/modules/products/hooks/use-products-table.tsx` — Columns + actions
- `src/modules/products/lib/products-table-settings.ts` — Settings shape + builders

### Layout helpers
- `src/components/layout/admin-page-layout/` — AdminPageShell, AppToolBar, AdminGridContainer, ExcelActions
- `src/components/layout/admin-filters/` — AdminFilters trigger
- `src/layouts/master-detail-layout/` — MasterDetailLayout

---

## 9. Recommendations

### Priority High
1. **Migrate Products → `useAdminTableSettings`** — unify UX với Employees, fix SSR flicker
2. **Fix `enableDensityToggle` no-op** — drop toggle hoặc drop `!important`
3. **Add `isHydrated` gate** to Products (line 372) trước `<AdminDataGrid />`

### Priority Medium
4. **Parametrize infinite scroll threshold** (400px hiện hard-coded ở `employees-list-screen.tsx:177`)
5. **Document column IDs as public API** — block rename nếu user đã pin
6. **Extract `withHeaderAwareColumnSizes` magic** — đưa vào tokens, document min sizing rule

### Priority Low
7. **Lazy load `AdminDataGrid`** cho non-list pages
8. **Visual regression test** cho settings sheet ở viewport < 400px (3-col grid có thể overflow)
9. **Migrate `mergeMuiRowProps` shallow merge** sang deep merge helper nếu cần nested sx

---

## 10. Unresolved Questions

- `enableDensityToggle: true` — giữ (no-op) hay xóa? UI affordance không có effect → user confusion cao.
- `enableColumnFilters: true` (MRT built-in) vs screen-level `AppToolBarFilters` (`InputSearch`) — hiện duplicate global filter capability. Có nên disable MRT built-in để single source of truth?
- Infinite scroll default `enableInfinite = false` (pre-hydration) → user lưu `true` → first page paginated fetch vô ích. Có cần optimistic default từ settings localStorage cache?

---

## 11. Verification Anchors

| Claim | Source |
|-------|--------|
| `layoutMode: "grid"` | `use-admin-table.tsx:350` |
| `paginationDisplayMode: "pages"` | `use-admin-table.tsx:354` |
| `positionActionsColumn: "last"` | `use-admin-table.tsx:352` |
| `enableTopToolbar: false` | `use-admin-table.tsx:351` |
| `density: "compact"` initial | `use-admin-table.tsx:359` |
| `cellPaddingY: 4`, `cellPaddingX: 12` | `admin-grid-tokens.ts:74-77` |
| `rowMinHeight: 32` | `admin-grid-tokens.ts:79` |
| `headerHeight: 32` | `admin-grid-tokens.ts:81` |
| `paginationItemSize: 22` | `admin-grid-tokens.ts:87` |
| `pageSizeOptions: [5, 10, 20, 50]` | `admin-grid-tokens.ts:101` |
| Hydration gate pattern | `employees-list-screen.tsx:121-123, 373` |
| Infinite threshold 400px | `employees-list-screen.tsx:177` |
| Pin `&:before` overlay | `use-admin-table.tsx:514-522, 736-745` |
| Drag-drop distance threshold | `column-layout-list.tsx:79` (`distance: 4`) |
| Settings sheet 3-col grid | `admin-table-settings-sheet.tsx:122` |
| Locale mapping (VI/EN) | `use-employees-table.tsx:81-82` |
| Footer aggregate pattern | `use-products-table.tsx:112-121, 133-142` |
| Row click → URL `selectedId` | `employees-list-screen.tsx:243`, `products-list-screen.tsx:454` |
| Auto-select first row guard | `employees-list-screen.tsx:148-166`, `products-list-screen.tsx:430-450` |

---

**Report completed:** Scope = employees + products + shared infrastructure. Other modules (departments, accounts, organizations, projects, investors) reuse same `useAdminTable` hook + AdminDataGrid wrapper → patterns trong report này cover toàn bộ admin pages.

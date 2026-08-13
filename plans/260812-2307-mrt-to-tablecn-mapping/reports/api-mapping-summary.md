# API Mapping Summary — MRT → TanStack Table

> Quick reference: every MRT prop/API → equivalent in our mockup or TanStack Table directly.
> Format: `MRT prop` | `TanStack equivalent` | `Mockup status` | `Notes`

---

## 1. Column Definition (12 APIs)

| MRT API | TanStack / Mockup | Status | Notes |
|---------|-------------------|--------|-------|
| `columns: MRT_ColumnDef[]` | `columns: ColumnDef[]` | ✅ 1-1 | TanStack native |
| `accessorKey` | ✅ built-in | ✅ | dot-path works |
| `accessorFn` | ✅ built-in | ✅ | |
| `id` | ✅ built-in | ✅ | for compound columns |
| `header: string \| ReactNode` | ✅ built-in | ✅ | via `flexRender` |
| `header: (props) => ReactNode` | ✅ built-in | ✅ | full context |
| `Cell: (props) => ReactNode` | ✅ `cell: (props) => ReactNode` | ✅ | mirror API |
| `footer: string \| ReactNode` | ✅ built-in | ✅ | render in `<tfoot>` |
| `enableHiding` | ✅ built-in | ✅ | |
| `enableSorting` (per-col) | ✅ built-in | ✅ | |
| `enableColumnFilter` (per-col) | ✅ built-in | ✅ | |
| `enableGlobalFilter` (per-col) | ✅ built-in | ✅ | |
| `enableGrouping` (per-col) | ⚠️ TanStack has `enableGrouping` | ✅ | |
| `size`, `minSize`, `maxSize` | ✅ built-in | ✅ | |
| `grow` | ❌ manual via CSS flex | ⚠️ | |
| `align`, `headerAlign`, `footerAlign` | ❌ manual sx | ⚠️ | add to `DataTableColumnDef` |

---

## 2. Rows (11 APIs)

| MRT API | TanStack / Mockup | Status | Notes |
|---------|-------------------|--------|-------|
| `enableRowSelection` | ✅ `enableRowSelection: true \| (row) => boolean` | ✅ | |
| `selectAllMode: "all" \| "page"` | ⚠️ `enableSubRowSelection: true` for "all" | ⚠️ | adapter needed |
| `enableSubRowSelection` | ✅ built-in | ✅ | |
| `getRowId` | ✅ built-in | ✅ | |
| `enableRowActions` | ❌ not built-in | 🆕 NEW | custom column |
| `positionActionsColumn` | ❌ not built-in | 🆕 NEW | manual placement |
| `renderRowActions` | ❌ not built-in | 🆕 NEW | custom column cell |
| `enableRowExpansion` | ✅ `enableExpanding` | ✅ | |
| `renderDetailPanel` | ✅ via `row.getIsExpanded()` | ✅ | custom render |
| `positionExpandColumn` | ❌ not built-in | 🆕 NEW | manual |
| `getIsRowExpanded` | ✅ built-in | ✅ | |

---

## 3. Sorting (6 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `enableSorting` | ✅ | ✅ | |
| `enableMultiSort` | ✅ | ✅ | |
| `isMultiSortEvent` | ✅ | ✅ | |
| `manualSorting` | ✅ | ✅ | |
| `sortingFns` | ✅ | ✅ | same names |
| `sortDescFirst` (per-col) | ✅ | ✅ | |

---

## 4. Filtering (14 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `enableColumnFilters` | ✅ | ✅ | |
| `enableGlobalFilter` | ✅ | ✅ | |
| `enableFacetedValues` | ⚠️ manual via `getFacetedRowModel` | ⚠️ | |
| `manualFiltering` | ✅ | ✅ | |
| `filterFns` | ✅ (slightly different names) | ⚠️ | adapter |
| `getColumnFilterFn` | ❌ not built-in | 🆕 NEW | |
| `getFilteredRowModel` | ✅ | ✅ | |
| `filterVariant` | ❌ not built-in | 🆕 NEW | custom UI dispatch |
| `filterSelectOptions` | ❌ not built-in | 🆕 NEW | |
| `filterPlaceholder` | ❌ not built-in | 🆕 NEW | |
| `columnFilterModeOptions` | ❌ not built-in | 🆕 NEW | |
| `renderColumnFilterMenu` | ❌ not built-in | 🆕 NEW | |
| `enableFilterMatchHighlighting` | ✅ (v8.10+) | ✅ | |
| Faceted: `getFacetedRowModel`, `getFacetedUniqueValues`, `getFacetedMinMaxValues` | ✅ same names | ✅ | |

**Filter function name mapping:**

| MRT | TanStack |
|-----|----------|
| `contains` | `includesString` |
| `equals` | `equals` |
| `startsWith` | manual |
| `endsWith` | manual |
| `empty` | `equals("", true)` |
| `notEmpty` | not equals "" |
| `inList` | `arrIncludesSome` |
| `between` | `inNumberRange` |
| `greaterThan` / `lessThan` | manual |
| `arrIncludes` | `arrIncludes` |

→ Need adapter layer for 1-1 mapping.

---

## 5. Pagination (9 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `enablePagination` | ✅ | ✅ | |
| `manualPagination` | ✅ | ✅ | |
| `rowCount` | ✅ | ✅ | |
| `pageCount` | ✅ | ✅ | deprecated alias |
| `paginationDisplayMode` | ❌ manual rendering | 🆕 NEW | use `renderBottomToolbar` |
| `muiPaginationProps` | ❌ not applicable (MUI-free) | 🆕 NEW | use `<DataTablePagination />` |
| `renderBottomToolbarCustomActions` | ❌ manual | 🆕 NEW | |
| `state.pagination` | ✅ | ✅ | |
| `onPaginationChange` | ✅ | ✅ | |

---

## 6. Row Virtualization (4 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `enableRowVirtualization` | ✅ | ✅ | built on `@tanstack/react-virtual` |
| `rowVirtualizerInstanceRef` | ✅ | ✅ | |
| `rowVirtualizerOptions` | ✅ | ✅ | |
| `enableColumnVirtualization` | ✅ | ✅ | less common |

---

## 7. Infinite Scroll (7 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `infinite.totalRowCount` | ❌ manual via `useInfiniteQuery` | 🆕 NEW | |
| `infinite.hasNextPage` | ❌ manual | 🆕 NEW | |
| `infinite.isFetchingNextPage` | ❌ manual | 🆕 NEW | |
| `infinite.fetchMoreOnBottomReached` | ❌ manual | 🆕 NEW | |
| `infinite.rowVirtualizerInstanceRef` | ❌ manual | 🆕 NEW | |
| Auto-disable pagination | ❌ manual | 🆕 NEW | conditional |
| Auto-enable virtualization | ❌ manual | 🆕 NEW | conditional |

**Recommendation:** Wrap `useInfiniteQuery` in `useDataTableInfinite()` hook.

---

## 8. Column Features (11 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `enableColumnPinning` | ✅ | ✅ | |
| `state.columnPinning` | ✅ | ✅ | |
| `onColumnPinningChange` | ✅ | ✅ | |
| `enableColumnResizing` | ✅ | ✅ | |
| `columnResizeMode` | ✅ | ✅ | |
| `state.columnSizing` | ✅ | ✅ | |
| `onColumnSizingChange` | ✅ | ✅ | |
| `enableColumnOrdering` | ❌ | 🆕 NEW | dnd-kit wrapper |
| `state.columnOrder` | ❌ | 🆕 NEW | |
| `enableHiding` | ✅ | ✅ | |
| `state.columnVisibility` | ✅ | ✅ | |

---

## 9. Row Features (9 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `enableRowDragging` | ❌ | 🆕 NEW | dnd-kit |
| `enableRowOrdering` | ❌ | 🆕 NEW | |
| `state.rowOrder` | ❌ | 🆕 NEW | |
| `enableEditing` | ❌ | 🆕 NEW | custom implementation |
| `editDisplayMode` | ❌ | 🆕 NEW | |
| `muiEditTextFieldProps` | ❌ | 🆕 NEW | |
| `enableRowExpansion` | ✅ `enableExpanding` | ✅ | |
| `renderDetailPanel` | ✅ | ✅ | |
| `onRowClick` | ✅ via `meta` or manual | ⚠️ | |

---

## 10. Toolbar (13 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `enableTopToolbar` | ❌ manual | 🆕 NEW | |
| `renderTopToolbarCustomActions` | ❌ manual | 🆕 NEW | |
| `muiTopToolbarProps` | ❌ manual | 🆕 NEW | |
| `enableToolbarInternalActions` | ❌ manual | 🆕 NEW | |
| `enableColumnToggle` (sub) | ❌ manual | 🆕 NEW | |
| `enableFilterToggle` (sub) | ❌ manual | 🆕 NEW | |
| `enableDensityToggle` (sub) | ❌ manual | 🆕 NEW | |
| `enableFullScreenToggle` (sub) | ❌ manual | 🆕 NEW | |
| `enableGlobalFilter` | ✅ | ✅ | |
| `globalFilterFn` | ✅ | ✅ | |
| `enableBottomToolbar` | ❌ manual | 🆕 NEW | |
| `renderBottomToolbarCustomActions` | ❌ manual | 🆕 NEW | |
| `renderToolbarAlertBannerContent` | ❌ manual | 🆕 NEW | |

---

## 11. Density + Fullscreen (5 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `enableDensityToggle` | ❌ manual | 🆕 NEW | |
| `initialState.density` | ❌ manual | 🆕 NEW | |
| `state.density` | ❌ manual | 🆕 NEW | |
| `enableFullScreenToggle` | ❌ manual | 🆕 NEW | |
| `state.isFullScreen` | ❌ manual | 🆕 NEW | |

---

## 12. Localization (4 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `localization: MRT_Localization` | ❌ manual | 🆕 NEW | mirror structure |
| `MRT_Localization_EN` | ❌ | 🆕 NEW | create `DATA_TABLE_LOCALIZATION_EN` |
| `MRT_Localization_VI` | ❌ | 🆕 NEW | create `DATA_TABLE_LOCALIZATION_VI` |
| Override key | ❌ manual | 🆕 NEW | |

---

## 13. State Control + Styling (10 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `state: Partial<MRT_TableState>` | ✅ extended | ⚠️ | union TanStack + custom keys |
| `initialState` | ✅ | ✅ | |
| `onStateChange` | ✅ | ✅ | |
| `muiTableBodyCellProps` | ❌ → `tableBodyCellProps` | 🆕 NEW | mirror naming |
| `muiTableBodyRowProps` | ❌ → `tableBodyRowProps` | 🆕 NEW | |
| `muiTableContainerProps` | ❌ → `tableContainerProps` | 🆕 NEW | |
| `muiTableHeadCellProps` | ❌ → `tableHeadCellProps` | 🆕 NEW | |
| `muiTablePaperProps` | ❌ → `tablePaperProps` | 🆕 NEW | |
| `displayColumnDefOptions` | ❌ | 🆕 NEW | manual |
| `defaultColumn` | ✅ | ✅ | |

---

## 14. Cell Editing (8 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `enableEditing` | ❌ | 🆕 NEW | |
| `editDisplayMode` | ❌ | 🆕 NEW | |
| `muiEditTextFieldProps` | ❌ | 🆕 NEW | |
| `onEditingCellChange` | ❌ | 🆕 NEW | |
| `onEditingRowChange` | ❌ | 🆕 NEW | |
| `onEditingRowSave` | ❌ | 🆕 NEW | |
| `editVariant` (per-col) | ❌ | 🆕 NEW | |
| `enableEditing` (per-row) | ❌ | 🆕 NEW | |

---

## 15. Keyboard Shortcuts (6 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `enableKeyboardShortcuts` | ❌ | 🆕 NEW | use `react-hotkeys-hook` |
| Arrow keys | ❌ | 🆕 NEW | |
| Home/End | ❌ | 🆕 NEW | |
| Page Up/Down | ❌ | 🆕 NEW | |
| Space/Enter toggle | ❌ | 🆕 NEW | |
| Custom `onKeyDown` | ✅ via `meta` | ⚠️ | |

---

## 16. Paste + Presence (9 APIs)

| MRT API | TanStack / Mockup | Status | Notes |
|---------|-------------------|--------|-------|
| `enableCellCopyPaste` | ❌ mockup-only | ✅ already | `data-grid` has this |
| `enableRowCopyPaste` | ❌ mockup-only | ✅ already | |
| `cellSelectionMode: "range"` | ❌ mockup-only | ✅ already | BEYOND MRT |
| `enablePresence` | ❌ mockup-only | ✅ already | BEYOND MRT |
| `onClipboardCopy` | ❌ mockup-only | ✅ already | |
| `onClipboardPaste` | ❌ mockup-only | ✅ already | |
| `onRowAdd` | ❌ mockup-only | ✅ already | |
| Cell range selection | ❌ mockup-only | ✅ already | |
| Collaborative cursors | ❌ mockup-only | ✅ already | |

---

## 17. Miscellaneous (8 APIs)

| MRT API | TanStack | Status | Notes |
|---------|----------|--------|-------|
| `idPrefix` | ❌ | 🆕 NEW | manual |
| `layoutMode` | ❌ | 🆕 NEW | |
| `enableStickyHeader` | ❌ CSS only | 🆕 NEW | |
| `enableStickyFooter` | ❌ CSS only | 🆕 NEW | |
| `renderEmptyRowsFallback` | ✅ manual | ✅ | |
| `renderRowSubComponent` | ✅ alias | ✅ | |
| `memoMode` | ❌ | 🆕 NEW | |
| `defaultColumn` | ✅ | ✅ | |

---

## Summary Statistics

| Status | Count | % |
|--------|-------|---|
| ✅ TanStack built-in (1-1) | 47 | 32% |
| ⚠️ TanStack partial / needs adapter | 14 | 10% |
| 🆕 NEW (mockup must implement) | 75 | 51% |
| ✅ Mockup already has (beyond MRT) | 10 | 7% |
| **Total** | **146** | **100%** |

**Key takeaway:** ~51% of MRT API surface needs new implementation in the mockup. TanStack provides ~32% out of the box, and ~10% needs adapter layer.

---

## Recommended Build Order

### Phase 1 — Foundation (1-2 days)
- [ ] Spec 01 — Columns (basic type extension)
- [ ] Spec 13 — State + slot props (extended state shape)
- [ ] Spec 02 — Rows (selection + actions scaffold)
- [ ] Spec 12 — Localization (i18n infrastructure)

### Phase 2 — Display (2-3 days)
- [ ] Spec 08 — Column pinning/resizing/visibility (most-used)
- [ ] Spec 10 — Toolbar (top + bottom + internal actions)
- [ ] Spec 05 — Pagination
- [ ] Spec 17 — Empty state + sticky

### Phase 3 — Data Flow (2-3 days)
- [ ] Spec 03 — Sorting
- [ ] Spec 04 — Filtering (variants + faceted)
- [ ] Spec 06 — Virtualization
- [ ] Spec 07 — Infinite scroll

### Phase 4 — Polish (2-3 days)
- [ ] Spec 09 — Row features (detail panel, drag)
- [ ] Spec 11 — Density + fullscreen
- [ ] Spec 14 — Cell editing (subset)
- [ ] Spec 15 — Keyboard shortcuts (subset)

### Phase 5 — Reference Only (no work)
- [ ] Spec 16 — Paste/presence (mockup already has — just document)

---

## File Path Summary

Reference documents (this plan):

```
plans/260812-2307-mrt-to-tablecn-mapping/
├── plan.md                                # execution plan — start here
├── research/mrt-feature-inventory.md      # canonical 146-feature list
├── reports/api-mapping-summary.md         # this file
└── spec/01..17-*.md                       # per-category MRT API detail
```

MRT source of truth being ported **from**:

```
plans/mockups/employees/                   # real Landsoft screen running MRT v2
```

Implementation target (real code):

```
src/types/table.ts                         # shared core types
src/lib/table/                             # column / style utils + localization
src/hooks/table/                           # useTableCore, settings, prefs
src/components/table/                      # shared toolbar + settings sheet
src/components/data-table/                 # paginated admin table
src/components/data-grid/                  # Excel-like editable grid
src/hooks/data-grid/                       # grid state hooks
src/mocks/                                 # mock data replacing the database
src/app/employees/                         # reference demo mirroring the mockup
```

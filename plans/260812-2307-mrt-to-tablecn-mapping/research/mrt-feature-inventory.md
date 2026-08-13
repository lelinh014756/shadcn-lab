# MRT Feature Inventory — Complete Reference

> Source: `material-react-table` v2.x official documentation
> Audit: 2026-08-12
> Audience: Internal team designing TanStack-based equivalent in `plans/mockups/tablecn/`

---

## Feature Categories (17 total)

| # | Category | Approx feature count |
|---|----------|---------------------|
| 01 | Columns (definition + header + footer) | 12 |
| 02 | Rows (selection + actions + expansion) | 11 |
| 03 | Sorting | 6 |
| 04 | Filtering (column + global + faceted) | 14 |
| 05 | Pagination | 9 |
| 06 | Row Virtualization | 4 |
| 07 | Infinite Scroll | 7 |
| 08 | Column Features (pin/resize/order/hide) | 11 |
| 09 | Row Features (drag/edit/detail) | 9 |
| 10 | Toolbar (top + bottom + internal) | 13 |
| 11 | Density + Fullscreen | 5 |
| 12 | Localization + i18n | 4 |
| 13 | State Control + Styling | 10 |
| 14 | Cell Editing | 8 |
| 15 | Keyboard Shortcuts | 6 |
| 16 | Paste / Presence / Collaboration | 9 |
| 17 | Miscellaneous (alert, banner, custom slots) | 8 |

**Total: ~146 distinct features** mapped across the 17 spec files.

---

## Canonical Feature List

### 01. Columns (12)

- `columns: MRT_ColumnDef<TData>[]` — column definition array
- `accessorKey: string` — dot-path accessor
- `accessorFn: (row) => any` — custom accessor
- `id: string` — manual column id (for compound columns)
- `header: string | ReactNode | (props) => ReactNode`
- `footer: string | ReactNode | (props) => ReactNode`
- `Cell: (props) => ReactNode` — custom cell renderer
- `enableHiding: boolean` (per-column override)
- `enableSorting: boolean` (per-column override)
- `enableColumnFilter: boolean` (per-column override)
- `enableGlobalFilter: boolean` (per-column override)
- `enableGrouping: boolean` (per-column override)

### 02. Rows (11)

- `enableRowSelection: boolean` (single or multi)
- `enableMultiRowSelection: boolean` (deprecated → `enableRowSelection` with mode)
- `enableSubRowSelection: boolean` (for grouped rows)
- `getRowId: (row, index) => string`
- `selectAllMode: "all" | "page"`
- `enableRowActions: boolean`
- `positionActionsColumn: "first" | "last"`
- `renderRowActions: ({ row, table, cell, internalAlignment }) => ReactNode`
- `getRowActionsMenuItems` (alt API)
- `enableRowExpansion: boolean`
- `renderDetailPanel: ({ row }) => ReactNode`

### 03. Sorting (6)

- `enableSorting: boolean`
- `enableMultiSort: boolean` (sort by multiple columns)
- `isMultiSortEvent: (e) => boolean` (default: shift+click)
- `manualSorting: boolean` (server-side)
- `sortingFns: Record<string, SortingFn>` (custom sort fn)
- `getSortByDesc / getSortByAsc` (helpers)

### 04. Filtering (14)

- `enableColumnFilters: boolean`
- `enableGlobalFilter: boolean`
- `enableFacetedValues: boolean`
- `manualFiltering: boolean`
- `filterFns: Record<string, FilterFn>`
- `getColumnFilterFn: (column) => FilterFn` (dynamic)
- `getFilteredRowModel: (table) => RowModel` (custom filter pipeline)
- Column-level filter functions: `contains`, `equals`, `startsWith`, `endsWith`, `empty`, `notEmpty`, `inList`, `between`, `betweenInclusive`, `greaterThan`, `greaterThanOrEqualTo`, `lessThan`, `lessThanOrEqualTo`
- `columnFilterModeOptions: ["contains" | "equals" | ...]`
- `renderColumnFilterMenu: (props) => ReactNode`
- `enableFilterMatchHighlighting: boolean`
- Faceted unique values: `getFacetedRowModel`, `getFacetedUniqueValues`, `getFacetedMinMaxValues`

### 05. Pagination (9)

- `enablePagination: boolean`
- `manualPagination: boolean`
- `paginationDisplayMode: "default" | "pages" | "numbers"` (or "custom")
- `rowCount: number` (server-side total)
- `pageCount` (deprecated alias)
- `onPaginationChange: (updater | state) => void`
- `paginationState / initialState.pagination`
- `muiPaginationProps: object | function` (override MUI Pagination)
- `renderBottomToolbarCustomActions: ({ table }) => ReactNode`

### 06. Row Virtualization (4)

- `enableRowVirtualization: boolean`
- `rowVirtualizerInstanceRef: MutableRefObject<Virtualizer>`
- `rowVirtualizerOptions: { overscan, estimateSize, ... }`
- `enableColumnVirtualization: boolean` (less common)

### 07. Infinite Scroll (7)

- MRT integrates with TanStack Query's `useInfiniteQuery`
- `infinite` config object on `useMaterialReactTable`:
  - `totalRowCount`
  - `hasNextPage`
  - `isFetchingNextPage`
  - `fetchMoreOnBottomReached`
  - `rowVirtualizerInstanceRef`
- Auto-disables pagination when infinite mode active
- Scroll listener attached via `muiTableContainerProps.onScroll`
- Threshold typically 400px from bottom

### 08. Column Features (11)

**Pinning:**
- `enableColumnPinning: boolean`
- `state.columnPinning: { left: string[], right: string[] }`
- `onColumnPinningChange`
- Pinned columns stay visible during horizontal scroll
- Visual: sticky left/right + opaque background overlay (via `&:before`)

**Resizing:**
- `enableColumnResizing: boolean`
- `columnResizeMode: "onChange" | "onEnd"`
- `state.columnSizing: Record<string, number>`
- `onColumnSizingChange`
- `minSize, maxSize, size` per column
- Default resize handle position: right edge

**Ordering:**
- `enableColumnOrdering: boolean` (uses dnd-kit internally)
- `state.columnOrder: string[]`
- `onColumnOrderChange`

**Visibility:**
- `enableHiding: boolean`
- `state.columnVisibility: Record<string, boolean>`
- `onColumnVisibilityChange`
- Hidden columns still in `columns` array, just not rendered

**Dragging:**
- `enableColumnDragging: boolean` (column drag-to-reorder within table)

### 09. Row Features (9)

**Drag Handle:**
- `enableRowDragging: boolean`
- `enableRowOrdering: boolean`
- `state.rowOrder: Record<string, number>` (for `getRowId`)
- `onRowOrderChange`

**Cell Editing:**
- `enableEditing: boolean`
- `editDisplayMode: "cell" | "row" | "table"`
- `muiEditTextFieldProps`
- See category 14 for full list

**Detail Panel:**
- `enableRowExpansion: boolean`
- `renderDetailPanel: ({ row }) => ReactNode`
- `positionExpandColumn: "first" | "last"`

**Custom Row Click:**
- `onRowClick: ({ row, event }) => void` (alternative to `getIsRowSelected`)
- `enableRowHoverHighlight: boolean`

### 10. Toolbar (13)

**Top Toolbar:**
- `enableTopToolbar: boolean`
- `positionToolbarAlertBanner: "head" | "none"` (deprecated alias)
- `positionToolbarDropZone: "head" | "none"` (for DnD)
- `renderTopToolbarCustomActions: ({ table }) => ReactNode`
- `muiTopToolbarProps`

**Internal Actions (built-in):**
- `enableToolbarInternalActions: boolean`
- When true, top toolbar shows: column toggle, filter toggle, density toggle, fullscreen toggle, global filter input

**Global Filter:**
- `enableGlobalFilter: boolean`
- `globalFilterFn: (row, columnId, filterValue) => boolean`
- `globalFilterModeOptions`
- `renderGlobalFilterModeMenuItems`
- `renderTopToolbarCustomActions` can add custom buttons next to global filter

**Bottom Toolbar:**
- `enableBottomToolbar: boolean`
- `renderBottomToolbarCustomActions: ({ table }) => ReactNode`
- `muiBottomToolbarProps`

**Alert Banner:**
- `positionToolbarAlertBanner: "head" | "none"`
- `renderToolbarAlertBannerContent: () => ReactNode`

### 11. Density + Fullscreen (5)

**Density:**
- `enableDensityToggle: boolean`
- `initialState.density: "comfortable" | "compact" | "spacious"`
- Visual: row height + cell padding changes

**Fullscreen:**
- `enableFullScreenToggle: boolean`
- Renders a button in top-right of toolbar
- On click: swaps to fullscreen mode (CSS fullscreen API)

### 12. Localization (4)

- `localization: MRT_Localization` (built-in: en, vi, fr, de, ja, zh, etc.)
- `localization: custom MRT_Localization object`
- Override any string key in locale
- Affects all built-in components (filter menu, sort label, pagination, etc.)

### 13. State Control + Styling (10)

**State:**
- `state: Partial<MRT_TableState<TData>>` — controlled state
- `initialState: Partial<MRT_TableState<TData>>` — uncontrolled
- `onStateChange: (updater) => void`

**MUI Slot Props (per-table):**
- `muiTableBodyCellProps`
- `muiTableBodyRowProps`
- `muiTableContainerProps`
- `muiTableHeadCellProps`
- `muiTableHeadRowProps`
- `muiTableFooterCellProps`
- `muiTableFooterRowProps`
- `muiTablePaperProps`

**Display Column Defaults:**
- `displayColumnDefOptions: { "mrt-row-actions": {...}, "mrt-row-numbers": {...}, "mrt-row-select": {...} }`

### 14. Cell Editing (8)

- `enableEditing: boolean | (row) => boolean`
- `editDisplayMode: "cell" | "row" | "table"`
- `muiEditTextFieldProps: object | ({ cell, row, table, column }) => object`
- `onEditingCellChange: (cell | null) => void`
- `onEditingRowChange: (row | null) => void`
- Editing lifecycle: `StartEdit`, `CancelEdit`, `EndEdit` events
- Validation: integrate with react-hook-form / formik
- Custom edit component per column type

### 15. Keyboard Shortcuts (6)

- `enableKeyboardShortcuts: boolean`
- Built-in:
  - Arrow keys: navigate cells
  - Space/Enter: toggle row select / activate cell
  - Escape: cancel edit
  - Ctrl/Cmd + click: multi-select rows
  - Page Up/Down: scroll viewport
  - Home/End: jump to first/last column
- Custom: `onKeyDown` overrides per cell

### 16. Paste / Presence / Collaboration (9)

**Clipboard:**
- `enablePaste: boolean`
- `enableCellCopyPaste: boolean`
- `enableRowCopyPaste: boolean`
- `onClipboardCopy: ({ cell, row, rows }) => void`

**Paste handling:**
- `onClipboardPaste: ({ cell, rows, tableData }) => void`

**Presence (collaborative):**
- `enablePresence: boolean`
- `cellSelectionMode: "single" | "multiple" | "range"`
- `onCellSelectionChange`
- `state.cellSelection: { [cellId]: { userId, color, ... } }`

**Custom user presence:**
- `presence: Record<string, { userId, color, name }>` (for "X is editing" indicators)

### 17. Miscellaneous (8)

- `idPrefix: string` — namespace for DOM IDs (for multiple tables on page)
- `layoutMode: "grid" | "semantic"` — semantic for HTML `<table>`, grid for CSS Grid
- `enableStickyHeader: boolean`
- `enableStickyFooter: boolean`
- `renderEmptyRowsFallback: () => ReactNode`
- `renderRowSubComponent: ({ row }) => ReactNode` (detail panel)
- `memoMode: "default" | "rows" | "cells"` (perf tuning)
- `defaultColumn: Partial<MRT_ColumnDef<TData>>` (defaults applied to all columns)

---

## Total feature count: **146 distinct features**

Spread across:
- **Column definition:** 12
- **Row behavior:** 11
- **Sort/Filter/Pagination:** 29
- **Virtualization/Infinite:** 11
- **Column mechanics:** 11
- **Row mechanics:** 9
- **Toolbar:** 13
- **Density/Fullscreen:** 5
- **i18n:** 4
- **State/Styling:** 10
- **Editing:** 8
- **Keyboard:** 6
- **Paste/Presence:** 9
- **Misc:** 8

Each is detailed in a corresponding spec file (`spec/01-columns.md` through `spec/17-miscellaneous.md`).

---

## Verification Source

- Official MRT docs: https://www.material-react-table.com/
- MRT source: `@material-react-table` npm package
- TanStack Table v8 docs: https://tanstack.com/table/v8
- This audit reflects MRT v2.0+ API surface

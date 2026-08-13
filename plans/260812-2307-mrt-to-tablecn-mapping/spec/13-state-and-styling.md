# 13 — State Control + Styling

> Source: MRT docs §State, §Styling
> Audit: 2026-08-12

## MRT API Surface

### State Control

```ts
state?: Partial<MRT_TableState<TData>>;       // controlled
initialState?: Partial<MRT_TableState<TData>>; // uncontrolled
onStateChange?: (updater) => void;
```

`MRT_TableState<TData>` shape (subset):
```ts
{
  columnOrder, columnPinning, columnSizing, columnVisibility,
  columnFilters, globalFilter, sorting, pagination,
  rowSelection, expanded, density, isFullScreen,
  grouping, rowPinning, rowSelection, showColumnFilters,
  // ...
}
```

### Per-table Slot Props

```ts
muiTableBodyCellProps?: object | (props: { cell, column, row, table }) => object;
muiTableBodyRowProps?: object | (props: { row, staticRowIndex, table }) => object;
muiTableContainerProps?: object | (props) => object;
muiTableHeadCellProps?: object | (props: { column, table }) => object;
muiTableHeadRowProps?: object | (props) => object;
muiTableFooterCellProps?: object | (props) => object;
muiTableFooterRowProps?: object | (props) => object;
muiTablePaperProps?: object | (props) => object;
```

### Display Column Defaults

```ts
displayColumnDefOptions?: {
  "mrt-row-actions": { size, minSize, grow, muiTableBodyCellProps, ... };
  "mrt-row-numbers": { ... };
  "mrt-row-select": { ... };
};
```

### Other Styling

```ts
defaultColumn?: Partial<MRT_ColumnDef<TData>>;
memoMode?: "default" | "rows" | "cells";  // perf tuning
```

## TanStack Equivalent

**State:**
- TanStack has same `state` / `onStateChange` / `initialState` API
- State shape is subset of MRT (no `density`, `isFullScreen`, `showColumnFilters`, etc. — those are MRT UI additions)

**Slot props:**
- TanStack has no `muiTableBodyCellProps` (since it's MUI-free)
- Use `meta: { ... }` on columns + custom rendering
- Or use `getRowCanSelect` + custom `<td>` wrappers

**Display column defaults:**
- TanStack has `defaultColumn` (1-1)
- `displayColumnDefOptions` not built-in — manual

**Memo mode:**
- TanStack has internal memoization; external `memoMode` not exposed

## Mockup Current State

- ✅ `data-table.tsx` uses native `Table`, `TableBody`, `TableCell` from shadcn/ui
- ✅ Custom CSS via Tailwind classes
- ⚠️ No centralized state control UI yet
- ⚠️ No per-component slot override pattern

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-slot-props.ts` (NEW) | Type for slot props (CSS class names + style overrides) |
| `data-table/data-table-state.ts` (NEW) | Extended state type (density, isFullScreen, etc.) |
| `data-table/data-table-display-columns.ts` (NEW) | `displayColumnDefOptions` equivalent |

## API Mirror Proposal

```ts
// Extended state (beyond TanStack)
interface DataTableState extends TableState {
  density?: "comfortable" | "compact" | "spacious";
  isFullScreen?: boolean;
  showColumnFilters?: boolean;
}

// Slot props — mirror MRT naming
interface DataTableSlotProps {
  tableBodyCellProps?: React.TdHTMLAttributes<HTMLTableCellElement> | ((ctx) => ...);
  tableBodyRowProps?: React.HTMLAttributes<HTMLTableRowElement> | ((ctx) => ...);
  tableContainerProps?: React.HTMLAttributes<HTMLDivElement>;
  tableHeadCellProps?: React.ThHTMLAttributes<HTMLTableCellElement> | ((ctx) => ...);
  tableFooterCellProps?: ...;
  tablePaperProps?: React.HTMLAttributes<HTMLDivElement>;
}

interface DataTableOptions<TData> {
  state?: DataTableState;
  initialState?: DataTableState;
  onStateChange?: (updater: Updater<DataTableState>) => void;
  slotProps?: DataTableSlotProps;
  displayColumnDefOptions?: {
    "mrt-row-actions"?: Partial<DataTableColumnDef<TData>>;
    "mrt-row-numbers"?: Partial<DataTableColumnDef<TData>>;
    "mrt-row-select"?: Partial<DataTableColumnDef<TData>>;
  };
  defaultColumn?: Partial<DataTableColumnDef<TData>>;
}
```

## Notes

- Slot props naming: drop `mui` prefix (we're MUI-free) but keep semantic names (`tableBodyCellProps` vs `cellProps`)
- Display columns: model as "virtual" columns added to `columns` array internally
- State extension: union TanStack `TableState` with our custom keys (density, isFullScreen)
- **Landsoft pattern:** Custom `mergeMuiRowProps` shallow-merge helper (`use-admin-table.tsx:71-81`) — replicate for our slot props

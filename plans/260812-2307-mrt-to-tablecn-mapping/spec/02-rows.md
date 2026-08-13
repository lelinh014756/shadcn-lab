# 02 — Rows (Selection, Actions, Expansion)

> Source: MRT docs §Rows
> Audit: 2026-08-12

## MRT API Surface

### Row Selection

```ts
enableRowSelection?: boolean;        // default false (single) or multi
selectAllMode?: "all" | "page";     // affects header checkbox behavior
enableSubRowSelection?: boolean;    // for grouped rows
getRowId?: (originalRow, index) => string;
```

State:
```ts
state: { rowSelection: Record<string, boolean> }
onRowSelectionChange: (updater) => void
```

### Row Actions

```ts
enableRowActions?: boolean;
positionActionsColumn?: "first" | "last";
renderRowActions?: (props: { row, table, cell, internalAlignment }) => ReactNode;
```

### Row Expansion

```ts
enableRowExpansion?: boolean;
positionExpandColumn?: "first" | "last";
renderDetailPanel?: (props: { row, table }) => ReactNode;
getIsRowExpanded?: (rowId) => boolean;
```

State:
```ts
state: { expanded: Record<string, boolean> }
onExpandedChange: (updater) => void
```

## TanStack Equivalent

| MRT feature | TanStack |
|-------------|----------|
| `enableRowSelection` | `enableRowSelection: true \| (row) => boolean` |
| `selectAllMode: "all"` | `enableSubRowSelection: true` |
| `getRowId` | `getRowId: (row, index) => string` (1-1) |
| `enableRowActions` | Not built-in — render via `cell` in column def |
| `renderRowActions` | Custom column with `cell: ({ row }) => <ActionsMenu />` |
| `enableRowExpansion` | `enableExpanding: true` |
| `renderDetailPanel` | Custom row renderer that checks `row.getIsExpanded()` |

## Mockup Current State

- ✅ `data-grid` has row selection (via `useDataGrid` hook — see `use-data-grid` import in `data-grid.tsx:11`)
- ✅ `data-grid-row.tsx` handles row state (selection, focus, hover)
- ✅ `data-grid-context-menu.tsx` provides row actions via context menu
- ✅ `data-grid` has row expansion (detail panel concept — collaborative editing)
- ⚠️ `data-table` has minimal row actions — relies on parent passing button components
- ⚠️ No `getRowId` standardization in `data-table`

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-row-actions.tsx` (NEW) | Standardized row actions dropdown matching MRT `renderRowActions` API |
| `data-table/data-table-detail-panel.tsx` (NEW) | `renderDetailPanel` slot for expansion |
| `data-table/data-table.tsx` (MODIFY) | Wire `getRowId`, `enableRowSelection`, `renderDetailPanel` |
| `data-table/data-table-row.tsx` (NEW) | Extract row component from grid for reuse |

## API Mirror Proposal

```ts
// Match MRT API exactly
interface DataTableOptions<TData> {
  enableRowSelection?: boolean;
  selectAllMode?: "all" | "page";
  enableSubRowSelection?: boolean;
  getRowId?: (row: TData, index: number) => string;

  enableRowActions?: boolean;
  positionActionsColumn?: "first" | "last";
  renderRowActions?: (props: {
    row: Row<TData>;
    table: Table<TData>;
    cell: Cell<TData, unknown>;
  }) => ReactNode;

  enableRowExpansion?: boolean;
  positionExpandColumn?: "first" | "last";
  renderDetailPanel?: (props: { row: Row<TData>; table: Table<TData> }) => ReactNode;
}
```

## Notes

- TanStack `enableRowSelection` accepts function for conditional selection (`(row) => boolean`)
- MRT's `selectAllMode: "all"` is achieved via `enableSubRowSelection: true` in TanStack
- Row actions are pure convention — no API gap, just need a wrapper

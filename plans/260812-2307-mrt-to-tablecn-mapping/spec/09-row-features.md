# 09 — Row Features (Drag, Edit, Detail)

> Source: MRT docs §Row Features
> Audit: 2026-08-12

## MRT API Surface

### Row Dragging / Ordering

```ts
enableRowDragging?: boolean;
enableRowOrdering?: boolean;
state: { rowOrder: Record<string, number> };  // keyed by getRowId
onRowOrderChange: (updater) => void;
positionRowDraggingColumn?: "first" | "last";
```

### Cell Editing

```ts
enableEditing?: boolean | ((row: Row) => boolean);
editDisplayMode?: "cell" | "row" | "table";
muiEditTextFieldProps?: object | (props) => object;
onEditingCellChange, onEditingRowChange, onEditingRowSave;
```

See `spec/14-editing.md` for full list.

### Detail Panel

```ts
enableRowExpansion?: boolean;
renderDetailPanel?: (props: { row, table }) => ReactNode;
positionExpandColumn?: "first" | "last";
getIsRowExpanded?: (rowId) => boolean;
```

### Custom Row Click

```ts
onRowClick?: (props: { row, event }) => void;
enableRowHoverHighlight?: boolean;
```

### Custom Row Styling

```ts
muiTableBodyRowProps: ({ row, staticRowIndex, table }) => TableRowProps;
```

## TanStack Equivalent

| MRT | TanStack |
|-----|----------|
| `enableRowDragging` | ❌ not built-in (need `@dnd-kit`) |
| `enableRowOrdering` | ❌ not built-in |
| `state.rowOrder` | ❌ not built-in |
| `enableRowExpansion` | ✅ `enableExpanding` |
| `renderDetailPanel` | ✅ custom via `row.getIsExpanded()` |
| `positionExpandColumn` | ❌ not built-in (manual column placement) |
| `onRowClick` | ✅ `meta: { onRowClick: ... }` + row event handlers |
| `muiTableBodyRowProps` | ✅ via `meta: { rowProps: ... }` or manual |

## Mockup Current State

- ✅ `data-grid-row.tsx` — handles row state (drag, selection, etc.)
- ✅ `data-grid-context-menu.tsx` — row context menu (alt to row actions)
- ✅ `data-grid-presence.tsx` — collaborative editing presence (beyond MRT)
- ✅ `data-grid-paste-dialog.tsx` — paste-to-row flow
- �️ No explicit `renderDetailPanel` pattern in `data-table.tsx`
- ⚠️ No row drag/reorder in mockup

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-row-drag.tsx` (NEW) | dnd-kit wrapper for row reordering |
| `data-table/data-table-detail-panel.tsx` (NEW) | Slot for `renderDetailPanel` |
| `data-table/data-table-row-click.ts` (NEW) | Type for `onRowClick` callback |

## API Mirror Proposal

```ts
interface DataTableRowFeaturesOptions<TData> {
  enableRowDragging?: boolean;
  enableRowOrdering?: boolean;
  positionRowDraggingColumn?: "first" | "last";

  enableRowExpansion?: boolean;
  renderDetailPanel?: (props: { row: Row<TData>; table: Table<TData> }) => ReactNode;
  positionExpandColumn?: "first" | "last";

  onRowClick?: (props: { row: Row<TData>; event: MouseEvent }) => void;
  enableRowHoverHighlight?: boolean;
}
```

## Notes

- Row drag: combine `useSortable` from `@dnd-kit/sortable` + custom column
- Detail panel: TanStack `getExpandedRowModel()` returns expanded rows; render after data rows
- `onRowClick` event: TanStack uses native `onClick` on `<tr>` via `meta`
- Hover highlight: pure CSS, no API gap

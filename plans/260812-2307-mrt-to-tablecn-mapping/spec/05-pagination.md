# 05 — Pagination

> Source: MRT docs §Pagination
> Audit: 2026-08-12

## MRT API Surface

```ts
enablePagination?: boolean;       // default true
manualPagination?: boolean;       // for server-side
rowCount?: number;                // total rows (server-side)
pageCount?: number;               // deprecated alias
paginationDisplayMode?: "default" | "pages" | "numbers" | "custom";
muiPaginationProps?: object | (props) => object;
renderBottomToolbarCustomActions?: (props: { table }) => ReactNode;
```

State:
```ts
state: { pagination: { pageIndex: number, pageSize: number } }
onPaginationChange: (updater) => void
initialState: { pagination: ... }
```

Default page size options: `[5, 10, 15, 20, 25, 30, 50, 100]`

## TanStack Equivalent

**Built-in (1-1):**
- `enablePagination`, `manualPagination`, `rowCount`, `pageCount`
- `state.pagination`, `onPaginationChange`
- `paginationDisplayMode` → not built-in; controlled by `renderBottomToolbar`

**Differences:**
- MRT's `paginationDisplayMode: "pages"` = MUI Pagination with sibling/boundary controls
- MRT's `"default"` = MUI Pagination simple
- MRT's `"custom"` = full custom render
- TanStack: only "show/hide pagination"; rendering is user responsibility

## Mockup Current State

- ✅ `data-table-pagination.tsx` — full pagination UI with page size select + page nav
- ✅ `data-table.tsx` (line 4) imports `DataTablePagination` and renders below table

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-pagination.tsx` (EXTEND) | Add `paginationDisplayMode` support + `renderBottomToolbarCustomActions` |
| `data-table/data-table-pagination-custom.tsx` (NEW) | Slot for fully custom pagination UI |

## API Mirror Proposal

```ts
interface DataTablePaginationOptions {
  enablePagination?: boolean;
  manualPagination?: boolean;
  rowCount?: number;
  paginationDisplayMode?: "default" | "pages" | "numbers" | "custom";
  renderBottomToolbarCustomActions?: (props: { table: Table<TData> }) => ReactNode;
}
```

## Notes

- `pageSizeOptions: [5, 10, 20, 50]` is hardcoded in Landsoft (`admin-grid-tokens.ts:101`) — should be configurable
- For server-side: pass `rowCount` from API response total
- `paginationDisplayMode: "numbers"` shows just page numbers, no prev/next buttons
- "Custom" mode bypasses built-in UI — useful for "showing X-Y of Z" + manual page nav

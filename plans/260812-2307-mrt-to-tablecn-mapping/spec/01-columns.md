# 01 — Columns (Definition, Header, Footer)

> Source: MRT docs §Columns
> Audit: 2026-08-12

## MRT API Surface

```ts
type MRT_ColumnDef<TData> = {
  // Identity
  id?: string;                          // default = accessorKey
  accessorKey?: string;                 // dot-path: "user.email"
  accessorFn?: (row: TData) => any;     // custom getter

  // Header
  header: string | ReactNode | (props) => ReactNode;
  enableHiding?: boolean;

  // Cell
  Cell?: (props: { cell, row, table, column }) => ReactNode;

  // Footer
  footer?: string | ReactNode | (props) => ReactNode;

  // Per-column feature overrides
  enableSorting?: boolean;
  enableColumnFilter?: boolean;
  enableGlobalFilter?: boolean;
  enableGrouping?: boolean;

  // Sizing
  size?: number; minSize?: number; maxSize?: number;
  grow?: boolean;

  // Display
  align?: "left" | "center" | "right";
  headerAlign?: ...;
  footerAlign?: ...;
};
```

## TanStack Equivalent

TanStack Table v8 has the same model — `columnDef` object with `accessorKey`, `accessorFn`, `id`, `header`, `cell`, `footer`, `enableSorting`, etc.

**Differences:**
- MRT has `align` / `headerAlign` (extra convenience for MUI sx)
- MRT's `Cell` is `{ cell, row, table, column }` vs TanStack `{ cell, row, table, column, renderValue, getValue }`
- MRT auto-resolves `accessorKey` to `accessorFn` (TanStack requires manual setup)

## Mockup Current State

- ✅ `data-table.tsx` uses `flexRender` from `@tanstack/react-table` for headers + cells
- ✅ `data-table-column-header.tsx` provides header UI with sort
- ✅ `data-table.tsx` line 50-53: renders header via `flexRender(header.column.columnDef.header, ...)`
- ⚠️ `Cell` / cell renderer not standardized — `data-table.tsx` uses default TanStack render

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-column-def.ts` (NEW) | Type alias for our extended `ColumnDef<T>` matching MRT API |
| `data-table/data-table-cell-wrapper.tsx` (NEW) | Wrapper for custom Cell rendering with `align` support |
| `data-table/data-table-footer-cell.tsx` (NEW) | Per-column footer with `footerAlign` |
| `data-table/data-table.tsx` (MODIFY) | Wire `Cell`, `footer`, `align` props |

## API Mirror Proposal

```ts
// Our extended ColumnDef — 1-1 with MRT API
interface DataTableColumnDef<TData> extends ColumnDef<TData> {
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  footerAlign?: "left" | "center" | "right";
  Cell?: (props: {
    cell: Cell<TData, unknown>;
    row: Row<TData>;
    table: Table<TData>;
    column: Column<TData, unknown>;
  }) => ReactNode;
}
```

## Notes

- `accessorKey` with dot-paths (`"user.email"`) works in TanStack via default accessor resolution
- Compound columns (no `accessorKey`, only `id` + `Cell`) work in TanStack but lose sort/filter
- `grow: true` — TanStack equivalent is `size: Number.MAX_SAFE_INTEGER` or use `flexRender` CSS

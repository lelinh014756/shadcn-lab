# 06 — Row Virtualization

> Source: MRT docs §Row Virtualization
> Audit: 2026-08-12

## MRT API Surface

```ts
enableRowVirtualization?: boolean;
rowVirtualizerInstanceRef?: MutableRefObject<Virtualizer<HTMLDivElement, Element>>;
rowVirtualizerOptions?: {
  overscan?: number;       // default 5
  estimateSize?: () => number;  // default 33 (compact)
  getScrollElement?: () => HTMLElement;
  scrollMargin?: number;
  // ... all @tanstack/react-virtual options
};
enableColumnVirtualization?: boolean;  // less common
```

Built on `@tanstack/react-virtual`.

## TanStack Equivalent

**Built-in:** `@tanstack/react-table` v8 supports row virtualization via:
```ts
enableRowVirtualization: true  // table option
```

This uses `@tanstack/react-virtual` under the hood. TanStack exposes:
- `table.getRowModel().rows` filtered by virtualization
- `rowVirtualizerInstanceRef` for scroll-to-index access

**Identical APIs** — just import and use.

## Mockup Current State

- ✅ `data-grid.tsx` uses `virtualTotalSize`, `virtualItems`, `measureElement` props (from `useDataGrid` hook)
- ✅ `use-data-grid` hook (referenced in `data-grid.tsx:11`) handles virtualization
- ⚠️ `data-table.tsx` has NO virtualization — renders all rows (fine for small datasets)

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-virtualized-row.tsx` (NEW) | Virtualized row renderer |
| `data-table/data-table.tsx` (MODIFY) | Add `enableRowVirtualization` prop pass-through |
| `data-table/use-data-table-virtualization.ts` (NEW) | Wrapper hook for `useVirtualizer` |

## API Mirror Proposal

```ts
interface DataTableVirtualizationOptions {
  enableRowVirtualization?: boolean;
  rowVirtualizerInstanceRef?: MutableRefObject<Virtualizer<HTMLDivElement, Element>>;
  rowVirtualizerOptions?: Partial<VirtualizerOptions<HTMLDivElement, Element>>;
  enableColumnVirtualization?: boolean;
}
```

## Notes

- TanStack has identical API — minimal work needed
- For dynamic row heights: use `estimateSize` + `measureElement` callback
- Column virtualization requires horizontal scrolling container setup
- Landsoft pattern: `gridSize.rowMinHeight: 32` (fixed) → virtualizer estimateSize returns 32
- Overscan 8 rows for smooth scroll (Landsoft config)

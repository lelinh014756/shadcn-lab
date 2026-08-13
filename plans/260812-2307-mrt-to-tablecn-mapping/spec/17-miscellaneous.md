# 17 — Miscellaneous Features

> Source: MRT docs (remaining items)
> Audit: 2026-08-12

## MRT API Surface

### Table Identification

```ts
idPrefix?: string;  // namespace for DOM IDs (multiple tables on page)
```

### Layout Mode

```ts
layoutMode?: "grid" | "semantic";
```

- `"grid"` — uses CSS Grid for layout (faster, more flexible)
- `"semantic"` — uses semantic HTML `<table>` (better a11y, print-friendly)

### Sticky Elements

```ts
enableStickyHeader?: boolean;
enableStickyFooter?: boolean;
```

### Empty State

```ts
renderEmptyRowsFallback?: () => ReactNode;
```

### Detail Sub-component (alt API)

```ts
renderRowSubComponent?: (props: { row, table }) => ReactNode;
```

(Alias for `renderDetailPanel` — kept for back-compat.)

### Alert Banner Position

```ts
positionToolbarAlertBanner?: "head" | "none" | "bottom";
```

### Drop Zone (for DnD)

```ts
positionToolbarDropZone?: "head" | "none" | "bottom";
```

### Memo Mode

```ts
memoMode?: "default" | "rows" | "cells";
```

### Default Column

```ts
defaultColumn?: Partial<MRT_ColumnDef<TData>>;
```

## TanStack Equivalent

| MRT | TanStack |
|-----|----------|
| `idPrefix` | ❌ not built-in (manual) |
| `layoutMode` | � not built-in |
| `enableStickyHeader` | ❌ CSS `position: sticky` |
| `enableStickyFooter` | ❌ CSS `position: sticky` |
| `renderEmptyRowsFallback` | ✅ `table.getRowModel().rows.length === 0` → render custom |
| `renderRowSubComponent` | ✅ same as `renderDetailPanel` |
| `positionToolbarAlertBanner` | ❌ not built-in (manual placement) |
| `memoMode` | � not exposed |
| `defaultColumn` | ✅ 1-1 |

## Mockup Current State

- ✅ `data-table-skeleton.tsx` — loading skeleton (custom, not MRT's empty fallback)
- ✅ Layout: `<div className="overflow-hidden rounded-md border">` (borderless = grid-like)
- ⚠️ No sticky header CSS in mockup
- ⚠️ No sticky footer

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-empty-state.tsx` (NEW) | `renderEmptyRowsFallback` |
| `data-table/data-table-sticky.tsx` (NEW) | Sticky header/footer CSS classes |
| `data-table/data-table-id-prefix.ts` (NEW) | ID prefix utility |

## API Mirror Proposal

```ts
interface DataTableMiscOptions<TData> {
  idPrefix?: string;
  layoutMode?: "grid" | "semantic";
  enableStickyHeader?: boolean;
  enableStickyFooter?: boolean;
  renderEmptyRowsFallback?: () => ReactNode;
  defaultColumn?: Partial<DataTableColumnDef<TData>>;
  memoMode?: "default" | "rows" | "cells";
}
```

## Notes

- Sticky header: `position: sticky; top: 0; z-index: 1;` on `<thead>` (or `<th>`)
- Sticky footer: same with `bottom: 0`
- Empty state: standard shadcn `<EmptyState>` pattern
- `idPrefix`: generate unique IDs for `<input>`, `aria-labelledby`, etc. when multiple tables on same page
- **Landsoft pattern:** Sticky header always enabled (`enableStickyHeader: true`), no sticky footer (bottom toolbar handles pagination)
- **Landsoft gap:** No `idPrefix` → if 2 tables on same page, accessibility IDs collide (potential a11y issue)

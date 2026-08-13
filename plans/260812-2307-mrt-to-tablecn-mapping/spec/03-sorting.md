# 03 — Sorting

> Source: MRT docs §Sorting
> Audit: 2026-08-12

## MRT API Surface

```ts
enableSorting?: boolean;             // table-level
enableMultiSort?: boolean;           // multi-column sort
isMultiSortEvent?: (e: MouseEvent) => boolean;  // default: shift+click
manualSorting?: boolean;             // server-side
sortingFns?: Record<string, SortingFn>;
```

State:
```ts
state: { sorting: Array<{ id: string, desc: boolean }> }
onSortingChange: (updater) => void
initialState: { sorting: ... }
```

Per-column:
```ts
{
  enableSorting?: boolean;  // default true
  sortingFn?: string | SortingFn;
  sortDescFirst?: boolean;  // default true
  sortUndefined?: -1 | 1;   // where to sort null/undefined
}
```

Built-in sorting functions:
- `alphanumeric`, `alphanumericCaseSensitive`
- `basic`, `basicCaseSensitive`
- `datetime`, `number`
- `text`, `textCaseSensitive`
- `fuzzy` (via external lib)

## TanStack Equivalent

**Built-in (1-1):**
- `enableSorting: boolean`
- `enableMultiSort: boolean`
- `isMultiSortEvent: (e) => boolean`
- `manualSorting: boolean`
- `sortingFns: { ... }`

**Sorting functions are identical:**
- `sortingFn: "alphanumeric" | "basic" | "datetime" | "number" | "text"`

**Per-column:**
- `enableSorting: boolean`
- `sortingFn: string | SortingFn`
- `sortDescFirst: boolean`

## Mockup Current State

- ✅ `data-table-sort-list.tsx` — displays active sorts
- ✅ `data-table-column-header.tsx` — sort UI on click
- ✅ Sort built into TanStack table instance
- ⚠️ `data-table-toolbar.tsx` has sort list but multi-sort UX unclear

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-sort-list.tsx` (EXTEND) | Add multi-sort UI |
| `data-table/data-table-column-header.tsx` (MODIFY) | Add shift-click hint, sort indicator |

## API Mirror Proposal

```ts
// Pass-through — TanStack already supports everything
interface DataTableSortOptions {
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  isMultiSortEvent?: (e: MouseEvent) => boolean;
  manualSorting?: boolean;
  sortingFns?: Record<string, SortingFn>;
}
```

## Notes

- No real work needed — TanStack has full sorting API parity
- Main UX work: make sort indicator + multi-sort UX match MRT (visual + keyboard)
- `sortUndefined` (where to place nulls) — TanStack supports via `sortUndefined` option
- `fuzzy` sort not built-in but easy to add via `fuzzysort` library

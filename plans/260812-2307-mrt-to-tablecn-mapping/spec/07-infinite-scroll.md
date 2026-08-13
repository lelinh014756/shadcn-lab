# 07 — Infinite Scroll

> Source: MRT docs §Infinite Scroll
> Audit: 2026-08-12

## MRT API Surface

```ts
// Special `infinite` config on useMaterialReactTable
infinite?: {
  totalRowCount: number;            // total from server (first page)
  hasNextPage: boolean;             // query hasNextPage
  isFetchingNextPage: boolean;      // query isFetchingNextPage
  fetchMoreOnBottomReached: (container?: HTMLElement) => void;
  rowVirtualizerInstanceRef: MutableRefObject<any>;
}
```

When `infinite` is set, MRT:
- Forces `enablePagination: false`
- Forces `enableRowVirtualization: true`
- Attaches `onScroll` listener to `muiTableContainerProps`
- Custom bottom toolbar showing "Fetched X of Y"

## TanStack Equivalent

**NOT built-in.** TanStack Table is server-state agnostic. You wire this yourself with TanStack Query's `useInfiniteQuery`:

```ts
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({ ... });

// Merge pages into single array for table
const flatData = useMemo(
  () => data?.pages.flatMap((page) => page.data) ?? [],
  [data],
);
```

Then pass to table + add scroll listener.

## Mockup Current State

- ✅ `data-grid-search.tsx` has search with virtualization (likely infinite-friendly)
- ❌ No explicit infinite scroll hook in mockup
- ⚠️ `data-table.tsx` assumes paginated data (single page array)

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/use-data-table-infinite.ts` (NEW) | `useInfiniteQuery` wrapper + flat merge |
| `data-table/data-table-infinite-toolbar.tsx` (NEW) | "Fetched X of Y" progress indicator |
| `data-table/data-table.tsx` (MODIFY) | Wire `infinite` config + scroll listener |

## API Mirror Proposal

```ts
interface DataTableInfiniteConfig<TData> {
  totalRowCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchMoreOnBottomReached: (container?: HTMLElement) => void;
  rowVirtualizerInstanceRef: MutableRefObject<any>;
}

interface DataTableOptions<TData> {
  infinite?: DataTableInfiniteConfig;
}
```

When `infinite` is provided:
- Auto-disable pagination
- Auto-enable row virtualization
- Auto-attach scroll listener
- Override bottom toolbar with progress

## Notes

- Landsoft pattern (`employees-list-screen.tsx:177`): scroll threshold = 400px from bottom
- Auto `scrollToIndex(0)` on filter change to prevent stale scroll position
- Single source of truth: `infinite.config.hasNextPage` controls fetch
- Pre-hydration guard: `enableInfinite = isHydrated ? applied.enableInfiniteScroll : false`
  - Avoids double fetch (paginated first → switch to infinite)

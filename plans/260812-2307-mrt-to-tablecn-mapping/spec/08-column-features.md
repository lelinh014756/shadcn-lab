# 08 — Column Features (Pinning, Resizing, Ordering, Visibility)

> Source: MRT docs §Column Features
> Audit: 2026-08-12

## MRT API Surface

### Pinning

```ts
enableColumnPinning?: boolean;
state: { columnPinning: { left: string[], right: string[] } };
onColumnPinningChange: (updater) => void;
initialState: { columnPinning: ... };
```

Visual: sticky left/right, opaque background overlay via `&:before`.

### Resizing

```ts
enableColumnResizing?: boolean;
columnResizeMode: "onChange" | "onEnd";
state: { columnSizing: Record<string, number> };
onColumnSizingChange: (updater) => void;
```

Per-column:
```ts
{ size, minSize, maxSize, grow }
```

### Ordering

```ts
enableColumnOrdering?: boolean;  // drag-and-drop columns
state: { columnOrder: string[] };
onColumnOrderChange: (updater) => void;
```

Uses `@dnd-kit/sortable` internally.

### Visibility

```ts
enableHiding?: boolean;
state: { columnVisibility: Record<string, boolean> };
onColumnVisibilityChange: (updater) => void;
```

### Drag (different from ordering)

```ts
enableColumnDragging?: boolean;  // drag a single column (not reorder)
```

## TanStack Equivalent

| MRT | TanStack |
|-----|----------|
| `enableColumnPinning` | ✅ built-in |
| `state.columnPinning` | ✅ 1-1 |
| `enableColumnResizing` | ✅ built-in |
| `columnResizeMode` | ✅ 1-1 |
| `state.columnSizing` | ✅ 1-1 |
| `enableColumnOrdering` | ❌ NOT built-in (need `@dnd-kit`) |
| `state.columnOrder` | ❌ NOT built-in |
| `enableHiding` | ✅ built-in |
| `state.columnVisibility` | ✅ 1-1 |

## Mockup Current State

- ✅ `data-grid.tsx` (line 14-16) uses `getColumnBorderVisibility`, `getColumnPinningStyle` from `@/lib/data-grid`
- ✅ `lib/data-grid.ts` likely has pinning helpers
- ✅ `data-table.tsx` (line 44) uses `getColumnPinningStyle({ column: header.column })`
- ⚠️ Drag-drop column ordering not visible in mockup (only sort list, not reorder)

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-column-drag.tsx` (NEW) | dnd-kit wrapper for column reordering |
| `data-table/data-table.tsx` (MODIFY) | Wire `columnOrder` state + dnd-kit sensors |
| `lib/data-table.ts` (NEW) | Pinning/visibility helpers (mirror `lib/data-grid.ts`) |

## API Mirror Proposal

```ts
// Pass-through for built-in features
interface DataTableColumnFeaturesOptions {
  enableColumnPinning?: boolean;
  enableColumnResizing?: boolean;
  columnResizeMode?: "onChange" | "onEnd";
  enableHiding?: boolean;
  enableColumnOrdering?: boolean;  // requires dnd-kit wrapper
  enableColumnDragging?: boolean;
}

// State mirror
interface DataTableColumnState {
  columnPinning?: { left: string[]; right: string[] };
  columnSizing?: Record<string, number>;
  columnOrder?: string[];
  columnVisibility?: Record<string, boolean>;
}
```

## Notes

- Pinning: TanStack handles via CSS `position: sticky` + `getColumnPinningStyle` helper
- Resizing: TanStack exposes resize handle position + mode
- Ordering: dnd-kit integration needed (similar to `column-layout-list.tsx` in Landsoft)
- Visibility: built-in, just toggle `columnVisibility` state

### Implementation priority

1. Pinning (most-used in Landsoft) — copy pattern from `@/lib/data-grid`
2. Resizing (built-in, easy)
3. Visibility (built-in, trivial)
4. Ordering (need dnd-kit setup)

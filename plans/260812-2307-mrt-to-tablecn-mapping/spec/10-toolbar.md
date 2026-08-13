# 10 — Toolbar (Top, Bottom, Internal Actions)

> Source: MRT docs §Toolbar
> Audit: 2026-08-12

## MRT API Surface

### Top Toolbar

```ts
enableTopToolbar?: boolean;        // default true
renderTopToolbarCustomActions?: (props: { table }) => ReactNode;
muiTopToolbarProps?: object | (props) => object;
positionToolbarAlertBanner?: "head" | "none" | "bottom";
positionToolbarDropZone?: "head" | "none" | "bottom";
```

### Internal Actions (built-in buttons)

```ts
enableToolbarInternalActions?: boolean;  // default true
```

When true, top toolbar shows:
- **Column toggle** (open visibility menu)
- **Filter toggle** (show/hide column filters)
- **Density toggle** (compact/comfortable/spacious)
- **Fullscreen toggle**
- **Global filter** (text input)

### Global Filter

```ts
enableGlobalFilter?: boolean;
globalFilterFn?: (row, columnId, filterValue) => boolean;
globalFilterModeOptions?: ("contains" | "equals" | ...);
renderGlobalFilterModeMenuItems?: (props) => ReactNode;
```

### Bottom Toolbar

```ts
enableBottomToolbar?: boolean;     // default true
renderBottomToolbarCustomActions?: (props: { table }) => ReactNode;
muiBottomToolbarProps?: object | (props) => object;
```

### Alert Banner

```ts
renderToolbarAlertBannerContent?: () => ReactNode;
```

## TanStack Equivalent

**NOT built-in** — toolbar is pure convention. TanStack provides:
- `table.getState()` for global filter / column filters
- `table.getHeaderGroups()` for headers

All toolbar UI must be built by user.

## Mockup Current State

- ✅ `data-table-toolbar.tsx` — top toolbar wrapper
- ✅ `data-table-advanced-toolbar.tsx` — extended variant
- ✅ `data-table-view-options.tsx` — column visibility toggle (built-in action)
- ✅ `data-table-sort-list.tsx` — sort indicator
- ✅ `data-table-filter-list.tsx` — active filter chips
- ✅ `data-table.tsx` (line 4) — `DataTablePagination` in bottom toolbar
- ✅ `data-table-action-bar.tsx` (?) — likely action bar pattern

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-top-toolbar.tsx` (NEW) | Top toolbar with all built-in actions |
| `data-table/data-table-bottom-toolbar.tsx` (NEW) | Bottom toolbar (pagination + custom actions) |
| `data-table/data-table-toolbar-actions.tsx` (NEW) | Internal actions container |
| `data-table/data-table-global-filter.tsx` (NEW) | Global filter input |

## API Mirror Proposal

```ts
interface DataTableToolbarOptions<TData> {
  enableTopToolbar?: boolean;
  renderTopToolbarCustomActions?: (props: { table: Table<TData> }) => ReactNode;

  enableToolbarInternalActions?: boolean;
  enableColumnToggle?: boolean;  // sub-toggle
  enableFilterToggle?: boolean;
  enableDensityToggle?: boolean;
  enableFullScreenToggle?: boolean;

  enableGlobalFilter?: boolean;
  globalFilterFn?: FilterFn<TData>;
  globalFilterModeOptions?: string[];

  enableBottomToolbar?: boolean;
  renderBottomToolbarCustomActions?: (props: { table: Table<TData> }) => ReactNode;

  renderToolbarAlertBannerContent?: () => ReactNode;
}
```

## Notes

- Toolbar is convention-driven — match Landsoft pattern: external toolbar (`enableTopToolbar: false`), screen composes `AppToolBar` instead
- Internal actions need to be opt-in per action (column toggle, filter, density, fullscreen)
- Global filter input: standard shadcn `<Input>` with `table.getState().globalFilter`
- Alert banner: useful for "X rows selected" message after bulk operations
- **Landsoft pattern:** Settings sheet replaces density/fullscreen toggles via custom `AdminTableSettings` component

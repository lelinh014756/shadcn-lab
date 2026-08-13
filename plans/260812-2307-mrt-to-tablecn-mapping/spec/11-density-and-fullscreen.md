# 11 — Density + Fullscreen

> Source: MRT docs §Density, §Full Screen Toggle
> Audit: 2026-08-12

## MRT API Surface

### Density

```ts
enableDensityToggle?: boolean;     // default true
initialState: { density: "comfortable" | "compact" | "spacious" };
```

Visual:
- **Comfortable:** default row height + padding
- **Compact:** smaller row height + reduced padding
- **Spacious:** larger row height + extra padding

MRT computes row height from density + cell padding.

### Fullscreen

```ts
enableFullScreenToggle?: boolean;  // default true
```

Renders a button in top toolbar. On click → swaps to browser fullscreen via CSS Fullscreen API.

## TanStack Equivalent

**NOT built-in** — both are pure UI concepts. TanStack exposes `state.density` if you store it; row height is determined by CSS.

## Mockup Current State

- � No density toggle in `data-table`
- ❌ No fullscreen toggle in `data-table`
- ⚠️ `data-grid` may have density via virtualization (different concerns)

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-density-toggle.tsx` (NEW) | 3-option density switcher |
| `data-table/data-table-fullscreen-toggle.tsx` (NEW) | Fullscreen toggle button |
| `data-table/data-table-row-variants.ts` (NEW) | CSS variants for row height per density |

## API Mirror Proposal

```ts
type DataTableDensity = "comfortable" | "compact" | "spacious";

interface DataTableDisplayOptions {
  enableDensityToggle?: boolean;
  initialDensity?: DataTableDensity;
  enableFullScreenToggle?: boolean;
}

// State extension
interface DataTableState {
  density?: DataTableDensity;
  isFullScreen?: boolean;
}
```

## Notes

- Density affects: row height, cell padding, font size
- Comfortable: 40px row, 12px padding, 14px font
- Compact: 32px row, 8px padding, 12px font (matches Landsoft)
- Spacious: 48px row, 16px padding, 14px font
- Fullscreen: use `document.documentElement.requestFullscreen()` + CSS `:fullscreen` selector

### Landsoft pattern

In Landsoft (`use-admin-table.tsx:359`), density is locked to `"compact"` and the toggle is no-op because `gridCellPaddingSx` uses `!important`. **Decision needed** for mockup: should density be user-toggleable or fixed?

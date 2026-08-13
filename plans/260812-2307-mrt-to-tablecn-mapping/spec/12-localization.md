# 12 — Localization + i18n

> Source: MRT docs §Localization
> Audit: 2026-08-12

## MRT API Surface

```ts
localization?: MRT_Localization;
```

Built-in locales (exported from `material-react-table/locales/{lng}`):
- `MRT_Localization_EN`, `MRT_Localization_VI`, `MRT_Localization_FR`
- `MRT_Localization_DE`, `MRT_Localization_JA`, `MRT_Localization_ZH`
- ... 30+ languages

`MRT_Localization` object:
```ts
{
  actions: "Actions",
  and: "and",
  cancel: "Cancel",
  changeFilterMode: "Change filter mode...",
  clearFilter: "Clear filter",
  clearSearch: "Clear search",
  clearSort: "Clear sort",
  // ... 100+ keys
}
```

## TanStack Equivalent

**NOT built-in.** TanStack is English-only and doesn't bundle any locale. All UI strings must come from app-level i18n (e.g., `react-i18next`, `next-intl`).

## Mockup Current State

- ⚠️ Mockup doesn't have built-in i18n — uses inline English strings
- No locale files imported

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/locales/en.ts` (NEW) | English strings (canonical defaults) |
| `data-table/locales/vi.ts` (NEW) | Vietnamese translations |
| `data-table/data-table-localization.ts` (NEW) | Type for locale object + accessor helpers |
| `data-table/use-data-table-locale.ts` (NEW) | Locale context hook |

## API Mirror Proposal

```ts
// Mirrors MRT_Localization structure
interface DataTableLocalization {
  actions: string;
  and: string;
  cancel: string;
  changeFilterMode: string;
  clearFilter: string;
  clearSearch: string;
  clearSort: string;
  columnActions: string;
  columnVisibility: string;
  // ... etc
}

interface DataTableOptions<TData> {
  localization?: DataTableLocalization;
}

// Built-in
export const DATA_TABLE_LOCALIZATION_EN: DataTableLocalization = { ... };
export const DATA_TABLE_LOCALIZATION_VI: DataTableLocalization = { ... };
```

## Usage Example

```tsx
<DataTable
  localization={DATA_TABLE_LOCALIZATION_VI}
  // ...
/>
```

## Notes

- Mirror MRT locale structure 1-1 — devs can swap MRT i18n code with minimal effort
- All toolbar/pagination/filter UI strings funnel through this object
- Per-component overrides via prop drilling if needed
- **Landsoft gap:** Some hard-coded VI strings in compound cells (`employees-table.tsx:135, 215, 271, 290, 335, 354`) — document as known issue

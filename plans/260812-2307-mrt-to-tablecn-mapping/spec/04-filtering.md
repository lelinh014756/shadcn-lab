# 04 — Filtering (Column, Global, Faceted)

> Source: MRT docs §Filtering
> Audit: 2026-08-12

## MRT API Surface

### Table-level

```ts
enableColumnFilters?: boolean;
enableGlobalFilter?: boolean;
enableFacetedValues?: boolean;
manualFiltering?: boolean;            // server-side
filterFns?: Record<string, FilterFn>;
getColumnFilterFn?: (column: Column<T>) => FilterFn;
getFilteredRowModel?: (table) => RowModel;  // custom pipeline
```

State:
```ts
state: {
  columnFilters: Array<{ id: string, value: unknown }>;
  globalFilter: string;
}
onColumnFiltersChange, onGlobalFilterChange
```

### Per-column

```ts
{
  enableColumnFilter?: boolean;
  filterFn?: string | FilterFn;
  filterVariant?: "text" | "range" | "select" | "multi-select" | "checkbox" | "date" | "date-range" | "autocomplete";
  filterSelectOptions?: string[];   // for select/multi-select
  filterDateRangeOptions?: ...;       // for date-range
  filterPlaceholder?: string;
  columnFilterModeOptions?: FilterMode[];  // user can switch between modes
}
```

### Filter functions (built-in)

```
"contains"  | "equals"  | "startsWith" | "endsWith"
"empty"     | "notEmpty" | "inList"
"between"   | "betweenInclusive"
"greaterThan" | "greaterThanOrEqualTo"
"lessThan"  | "lessThanOrEqualTo"
"arrIncludes" | "arrIncludesAll" | "arrIncludesSome"
```

### Other

```ts
enableFilterMatchHighlighting?: boolean;
renderColumnFilterMenu?: (props) => ReactNode;
getFacetedRowModel, getFacetedUniqueValues, getFacetedMinMaxValues
```

## TanStack Equivalent

**Table-level:**
- ✅ `enableColumnFilters`, `enableGlobalFilter`, `manualFiltering`, `filterFns`
- ⚠️ `enableFacetedValues` — TanStack requires manual faceted value computation via `getFacetedRowModel` (same name)

**Filter functions:**
- ✅ Most match: `includesString`, `equals`, `arrIncludes`, `inNumberRange`
- ⚠️ Naming differs slightly (`includesString` vs `contains`)

**Per-column:**
- ❌ `filterVariant` — not built-in, requires custom UI component
- ✅ `filterFn: string | FilterFn`
- ❌ `columnFilterModeOptions` — not built-in, requires custom menu

**Faceted:**
- ✅ `getFacetedRowModel`, `getFacetedUniqueValues`, `getFacetedMinMaxValues` (same names)

## Mockup Current State

- ✅ `data-table-faceted-filter.tsx` — faceted filter UI (checkboxes)
- ✅ `data-table-date-filter.tsx` — date range filter
- ✅ `data-table-slider-filter.tsx` — slider/range filter
- ✅ `data-table-range-filter.tsx` — number range filter
- ✅ `data-table-filter-list.tsx` — active filter chips
- ✅ `data-table-filter-menu.tsx` — column filter menu
- ✅ `data-table-search.tsx` (in data-grid) — search input
- ⚠️ No standardization for `filterVariant` — each filter is bespoke

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-filter-variant.ts` (NEW) | Type alias for filter variants + dispatcher |
| `data-table/data-table-filter-text.tsx` (NEW) | Text variant (`contains`/`equals`/`startsWith`) |
| `data-table/data-table-filter-select.tsx` (NEW) | Select variant (single + multi) |
| `data-table/data-table-filter-checkbox.tsx` (NEW) | Checkbox variant |

## API Mirror Proposal

```ts
// Filter variants — mirror MRT
type DataTableFilterVariant =
  | "text" | "range" | "select" | "multi-select"
  | "checkbox" | "date" | "date-range" | "autocomplete";

interface DataTableColumnFilterDef<TData> {
  enableColumnFilter?: boolean;
  filterFn?: string | FilterFn<TData>;
  filterVariant?: DataTableFilterVariant;
  filterSelectOptions?: string[];
  filterPlaceholder?: string;
  columnFilterModeOptions?: string[];  // e.g. ["contains", "equals"]
}
```

## Notes

- TanStack filter fn names differ slightly — need adapter layer for 1-1 mapping
- Most filter UI work already done in mockup — just need to standardize
- Global filter: TanStack uses `globalFilterFn` (not `filterFn`); MRT supports `globalFilterFn` too
- `enableFilterMatchHighlighting` — TanStack has `enableFilterMatchHighlighting` since v8.10+

# 14 — Cell Editing

> Source: MRT docs §Editing
> Audit: 2026-08-12

## MRT API Surface

```ts
enableEditing?: boolean | ((row: Row<TData>) => boolean);
editDisplayMode?: "cell" | "row" | "table";
muiEditTextFieldProps?: object | (props: { cell, row, table, column }) => object;
```

### Edit Lifecycle

```ts
onEditingCellChange?: (cell: MRT_Cell<TData> | null) => void;
onEditingRowChange?: (row: MRT_Row<TData> | null) => void;
onEditingRowSave?: (props: { row, values, table }) => void | Promise<void>;
```

### Edit Modes

- **`"cell"`** — single cell editable on click
- **`"row"`** — entire row enters edit mode (all cells editable)
- **`"table"`** — table-wide edit mode (toggle button)

### Per-cell Edit Behavior

```ts
{
  // On column def
  editVariant?: "text" | "select" | "textarea" | "date" | "datetime" | "checkbox" | "multiselect";
  enableEditing?: (row) => boolean;  // per-row override
  mantineEditTextInputProps?: ...;  // per-edit-component props
}
```

## TanStack Equivalent

**NOT built-in.** TanStack is read-only by default. Editing requires custom implementation.

## Mockup Current State

- ✅ `data-grid` has full editing (cell-level, paste, presence) — this is **beyond MRT scope**
- ✅ `data-grid-paste-dialog.tsx` — paste-to-cell flow
- ✅ `data-grid-presence.tsx` — collaborative editing indicators
- ✅ `data-grid-cell-variants.tsx` — different cell edit states
- ✅ `data-grid-cell-wrapper.tsx` — cell wrapper for edit mode
- ❌ `data-table` has NO editing (read-only)

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-editable-cell.tsx` (NEW) | Cell with edit-on-click behavior |
| `data-table/data-table-editable-row.tsx` (NEW) | Row-level edit mode wrapper |
| `data-table/data-table-edit-mode-toggle.tsx` (NEW) | Table-wide edit toggle |
| `data-table/data-table-edit-variants.ts` (NEW) | Edit variant dispatcher (text/select/date/etc.) |

## API Mirror Proposal

```ts
type DataTableEditDisplayMode = "cell" | "row" | "table";
type DataTableEditVariant = "text" | "select" | "textarea" | "date" | "datetime" | "checkbox" | "multiselect";

interface DataTableEditingOptions<TData> {
  enableEditing?: boolean | ((row: Row<TData>) => boolean);
  editDisplayMode?: DataTableEditDisplayMode;
  editTextFieldProps?: object | ((ctx: { cell, row, table, column }) => object);

  onEditingCellChange?: (cell: Cell<TData, unknown> | null) => void;
  onEditingRowChange?: (row: Row<TData> | null) => void;
  onEditingRowSave?: (props: { row: Row<TData>; values: Record<string, unknown>; table: Table<TData> }) => void | Promise<void>;
}

// Per-column
interface DataTableColumnDef<TData> {
  editVariant?: DataTableEditVariant;
  enableEditing?: (row: Row<TData>) => boolean;
  editSelectOptions?: string[];  // for "select" variant
}
```

## Notes

- Cell editing: integrate with `react-hook-form` for form-level validation
- Row editing: track dirty state per row, save on blur / explicit save button
- Table editing: enter edit mode via toolbar button; all cells become editable
- **Mockup advantage:** `data-grid` already has paste/presence which is BEYOND MRT — use as reference for advanced editing
- **Landsoft pattern:** No editing (read-only CRUD via separate sheets/forms) — simpler, less error-prone

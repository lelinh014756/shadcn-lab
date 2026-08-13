# 15 — Keyboard Shortcuts

> Source: MRT docs §Keyboard Shortcuts
> Audit: 2026-08-12

## MRT API Surface

```ts
enableKeyboardShortcuts?: boolean;  // default true
```

### Built-in Shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` `←` `→` | Navigate cells |
| `Tab` / `Shift+Tab` | Next/prev cell |
| `Home` / `End` | First/last cell in row |
| `Ctrl/Cmd+Home` | First cell in table |
| `Ctrl/Cmd+End` | Last cell in table |
| `Page Up/Down` | Scroll viewport |
| `Space` / `Enter` | Toggle row selection / activate cell |
| `Escape` | Cancel edit |
| `Ctrl/Cmd+Click` | Multi-select rows |
| `Shift+Click` | Range-select rows |
| `Ctrl/Cmd+A` | Select all rows |
| `Ctrl/Cmd+Z/Y` | Undo/redo (if editing) |

### Custom

```ts
onKeyDown?: (event: KeyboardEvent) => void;  // per-cell override
```

## TanStack Equivalent

**NOT built-in.** TanStack has `meta` + `onKeyDown` events but no keyboard shortcut system.

## Mockup Current State

- ✅ `data-grid-keyboard-shortcuts.tsx` — comprehensive shortcut handling
- ✅ Beyond MRT: includes paste shortcuts, cell navigation, range selection
- ❌ `data-table` has no keyboard shortcuts

## Files To Add / Modify

| File | Purpose |
|------|---------|
| `data-table/data-table-keyboard-shortcuts.tsx` (NEW) | Shortcut handler (subset of `data-grid-keyboard-shortcuts.tsx`) |
| `data-table/use-data-table-shortcuts.ts` (NEW) | Hook to register shortcuts on table |

## API Mirror Proposal

```ts
interface DataTableKeyboardShortcutsOptions {
  enableKeyboardShortcuts?: boolean;
  shortcuts?: {
    onSelectAll?: () => void;
    onActivateCell?: (cell: Cell) => void;
    onToggleRowSelection?: (row: Row) => void;
    // ... extensible
  };
}
```

## Notes

- Use `useHotkeys` from `react-hotkeys-hook` library
- For "Beyond MRT" features (paste, range select) — keep these as `data-grid`-only, not core `data-table`
- Document which shortcuts are table-level vs cell-level
- **Landsoft pattern:** No keyboard shortcuts — row click selects, no keyboard nav. Simpler UX.

# 16 — Paste, Presence, Collaboration (Beyond MRT Scope)

> Source: `data-grid` mockup files (BEYOND MRT scope — included for reference)
> Audit: 2026-08-12

## Context

Material React Table v2 has limited paste/clipboard support but NO collaborative presence. The `data-grid` mockup goes BEYOND MRT with Google-Sheets-like features.

This spec documents those features for reference. They are **not part of MRT API parity** but useful to know about.

## Mockup Features (Beyond MRT)

### Cell Copy/Paste

```ts
enableCellCopyPaste?: boolean;
enableRowCopyPaste?: boolean;
onClipboardCopy?: (props: { cell, row, rows }) => void;
onClipboardPaste?: (props: { cell, rows, tableData }) => void;
```

Files:
- `data-grid-paste-dialog.tsx` — paste mode toggle (replace/insert)
- `data-grid-context-menu.tsx` — copy/paste context menu

### Cell Selection (range)

```ts
cellSelectionMode?: "single" | "multiple" | "range";
onCellSelectionChange?: (selection) => void;
state: { cellSelection: { [cellId]: true } };
```

Used for: copy/paste range, formula references, collaborative highlighting.

### Presence (collaborative editing)

```ts
enablePresence?: boolean;
presence?: Record<string, { userId: string; color: string; name: string }>;
state: { cellSelection: { [cellId]: { userId: string } } };
```

Files:
- `data-grid-presence.tsx` — render other users' selections + cursors
- Used with WebSocket / Yjs / Liveblocks for real-time sync

### Add Row (inline)

```ts
onRowAdd?: (event: React.MouseEvent) => void;
```

Files:
- `data-grid-add-row.tsx` (?) — "+ Add row" button below table

## Files Already in Mockup

| File | Purpose |
|------|---------|
| `data-grid-cell-variants.tsx` | Different cell render variants (text, number, select, date, etc.) |
| `data-grid-cell-wrapper.tsx` | Cell wrapper with edit + selection states |
| `data-grid-context-menu.tsx` | Right-click menu (copy/paste/insert/delete) |
| `data-grid-copy-paste.ts` (?) | Clipboard utility |
| `data-grid-paste-dialog.tsx` | Paste mode confirmation dialog |
| `data-grid-presence.tsx` | Collaborative editing presence |
| `data-grid-select-column.tsx` | Range selection column |

## Mapping to MRT

| Mockup feature | MRT equivalent | Status |
|----------------|----------------|--------|
| `enableCellCopyPaste` | ✅ (basic) | Mockup is more advanced |
| `enableRowCopyPaste` | ✅ (basic) | Mockup is more advanced |
| `cellSelectionMode: "range"` | ❌ NOT in MRT | Mockup has this |
| `enablePresence` | ❌ NOT in MRT | Mockup has this |
| `onRowAdd` | ❌ NOT in MRT | Mockup has this |

## Notes

- These features are valuable for spreadsheet-style use cases (e.g., admin data entry)
- For Landsoft admin pages, paste/presence are NOT needed (CRUD via sheets)
- For mockup completeness, document but mark as "beyond MRT"
- If implementing these, use Yjs (CRDT) + Liveblocks/Hocuspocus for production

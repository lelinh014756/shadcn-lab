---
name: mrt-to-tablecn-mapping
description: Port the Material React Table setup flow into tablecn — shared core, mock data layer, reference Employees demo
metadata:
  type: plan
  status: implemented
---

# Plan: Port the MRT setup flow into tablecn

> **Goal:** Restructure `src/components/data-table` and `src/components/data-grid` to follow the way Material React Table is set up — its layering and data flow, not its styling. Styling stays shadcn/ui + TanStack Table.
> **Also in scope:** remove the database coupling, add a mock data layer, and build a reference demo that reproduces the MRT screen.

---

## Roles of each directory

This was stated backwards in the previous revision of this document, which
caused the file paths below it to be wrong. To be explicit:

| Path | Role |
|---|---|
| `plans/mockups/employees/` | **Source.** Real screen from Landsoft-One-Web running MRT v2. What we port *from*. Not compiled — excluded in `tsconfig.json`. |
| `plans/reports/research-260812-*.md` | Audit of that MRT setup (layering, tokens, settings sheet, failure modes). |
| `plans/260812-2307-mrt-to-tablecn-mapping/spec/` | Per-category MRT API detail, 17 files. Reference while implementing. |
| `src/` | **Target.** Where the port lands. |

> There is no `plans/mockups/tablecn/` directory. Earlier revisions of this plan
> and of `reports/api-mapping-summary.md` pointed at one; both are corrected.

---

## Status

| Phase | Status |
|-------|--------|
| Research (feature inventory, 146 features) | ✅ done |
| Spec (17 category files) | ✅ done |
| API mapping summary | ✅ done |
| 1 — Remove the database, build the mock layer | ✅ done |
| 2 — Shared core (`useTableCore`) | ✅ done |
| 3 — data-table onto the core | ✅ done |
| 4 — Settings sheet + shared toolbar | ✅ done |
| 5 — Employees reference demo | ✅ done |
| 6 — data-grid onto the instance contract | ⚠️ done except the hook split (see below) |
| 7 — Registry + docs | ✅ done |

---

## The architecture being copied

MRT's real leverage is not its components — it is that **the table instance is
the only transport**. Every renderer, slot prop and localization value lives on
`table.options`, so a renderer takes one prop. That is what makes its four tiers
separable:

```
Tier 4  Screen        employees-list-screen.tsx     compose only, no business logic
Tier 3  Feature hook  useEmployeesTable()           columns + option overrides
Tier 2  Stack hook    useDataTable / useDataGrid    URL state / cell editing
Tier 1  Core          useTableCore()                defaults, display columns, extra state
Tier 0  Renderer      <DataTable table={table} />   dumb; reads table.options
```

Before this port tablecn had no tier 1, and tier 0 was fused into tier 4:

```tsx
// before
<DataGrid {...dataGridProps} table={table} height={height} />   // ~20 loose props
<DataTable table={table} actionBar={bar}>{toolbarJsx}</DataTable>

// after
<DataGrid table={table} />
<DataTable table={table} actionBar={bar} />
```

### Naming

Mirror MRT for everything MRT adds on top of TanStack: `enableRowActions`,
`renderRowActions`, `positionActionsColumn`, `renderDetailPanel`,
`renderEmptyRowsFallback`, `enableStickyHeader/Footer`, `layoutMode`,
`state.density`, `state.isFullScreen`, `state.showSkeletons`,
`state.showProgressBars`, `localization`, `idPrefix`.

| MRT | tablecn |
|---|---|
| `useMaterialReactTable` | `useDataTable` / `useDataGrid` |
| `<MaterialReactTable table />` | `<DataTable table />` / `<DataGrid table />` |
| `MRT_ColumnDef` / `MRT_TableInstance` | `DataTableColumnDef` / `TableCoreInstance` |
| `mrt-row-select` / `-numbers` / `-expand` / `-actions` | `dt-row-select` / `-numbers` / `-expand` / `-actions` |
| `MRT_Localization_VI` | `tableLocalizationVi` |

### Deviations from MRT (deliberate)

1. **`Cell` / `Header` / `Footer` stay lowercase.** MRT capitalizes them only to
   avoid colliding with TanStack's own keys. We *are* TanStack — nothing to
   collide with, and lowercase keeps `flexRender` working unchanged.
2. **`mui*Props` → `slotProps.*`.** Same `object | (ctx) => object` contract,
   no MUI. Typed as `React.HTMLAttributes<HTMLElement>` because the two
   renderers mount slots on different elements (`<td>` vs `<div>`).
3. **`sx` tokens → Tailwind + CSS variables.** `admin-grid-tokens.ts` is not
   ported; density lives in `src/lib/table/style-utils.ts`.

---

## What was built

### Tier 1 — shared core

```
src/types/table.ts                        DISPLAY_COLUMN_IDS, Density, LayoutMode,
                                            TableExtraState, TableSlotProps, TableLocalization,
                                            TableCoreOptions
src/lib/table/column-utils.ts             getColumnPinningStyle (merged from the two prior
                                            copies), getHeaderAwareMinSize
src/lib/table/style-utils.ts              density → padding / row height, align classes
src/lib/table/localization/{en,vi}.ts     tableLocalizationEn / tableLocalizationVi
src/hooks/table/use-table-core.ts         ★ merges defaults, injects display columns,
                                            owns the extra state, returns the instance
src/hooks/table/use-table-display-columns.tsx   dt-row-select / -numbers / -expand / -actions
src/hooks/table/use-table-extra-state.ts  density, isFullScreen, showColumnFilters,
                                            showGlobalFilter, showSkeletons, showProgressBars
src/hooks/table/use-table-settings.ts     draft / applied state machine
src/hooks/table/use-table-prefs.ts        localStorage + version + reconcile, SSR-safe
src/components/table/                     toolbar buttons, empty state, progress bar,
                                            provider, settings/ sheet
```

`TableCoreInstance<TData>` intersects TanStack's resolved options with ours, so
the instance stays a valid `Table<TData>` and can be handed to any plain
TanStack helper. Only `getState` is replaced outright — an intersection there
would resolve to the narrower TanStack return type and hide the extra state.

### Tier 0/2 — the two stacks

```
src/components/data-table/
  data-table.tsx              paper: fullscreen + toolbars + container
  table/ head/ body/ footer/  container, head, body, detail panel, summary footer
  toolbar/                    top toolbar, bottom toolbar, pagination
  menus/ inputs/              sort list, filter list/menu, per-variant filter inputs

src/components/data-grid/
  data-grid.tsx               renderer, props = { table }
  head/ body/ footer/         column header, row, cell, cell wrapper
  body/cells/                 9 files, split from the 2,132-line cell-variants file
  menus/ modals/              filter/sort/row-height/context menus, paste dialog, shortcuts

src/hooks/data-grid/
  use-data-grid.ts            orchestrator; returns the instance with `.grid`
  use-data-grid-store.ts      useSyncExternalStore state container
  use-data-grid-undo-redo.ts
```

### Mock layer (replaces the database)

```
src/lib/mock/mock-store.ts    in-memory CRUD + subscribe
src/lib/mock/query-rows.ts    filter / sort / paginate, all 14 operators from
                                dataTableConfig — replaces the Drizzle SQL builder
src/lib/mock/mock-latency.ts  so skeletons and progress bars are observable
src/mocks/{employees,tasks,skaters,people}/
```

Datasets are generated with a fixed `faker.seed()` so they are stable across
reloads and identical on server and client.

**Deleted:** `src/db/`, `drizzle/`, `drizzle.config.ts`, `docker-compose.yml`,
`src/app/lib/{queries,actions,seeds,utils}.ts`, `src/app/api/`,
`src/lib/{filter-columns,rate-limit,uploadthing}.ts`,
`src/components/uploadthing-ssr.tsx`, `src/env.js`, `.env*`.
**Dependencies removed:** `drizzle-orm`, `drizzle-kit`, `postgres`,
`uploadthing`, `@uploadthing/react`, `@upstash/ratelimit`, `@upstash/redis`,
`@t3-oss/env-nextjs`, `dotenv-cli`, `server-only`. All `db:*` scripts dropped.

### Demos

| Route | What it proves |
|---|---|
| `/employees` | The full ported flow: 19 columns, master-detail, settings sheet (drag-reorder, width, pin L/R, visibility), infinite-scroll toggle, row actions, URL-driven filters |
| `/` | data-table on the new core: filters, sort, pagination, advanced filter builder, action bar |
| `/data-grid` | Excel-like editing, range paste, undo/redo, search, RTL |
| `/data-grid-live` | Optimistic CRUD through a mock `@tanstack/react-db` collection |
| `/data-grid-multiplayer` | PartyKit presence (needs `pnpm dev:multiplayer`) |

---

## Answers to the previously unresolved questions

1. **`layoutMode`** — support both. `semantic` is the default and what
   data-table uses; `grid` is what data-grid uses (it needs CSS grid for
   virtualization). Exposed as `TableCoreOptions.layoutMode`.
2. **Density toggle** — made a **real** toggle. The reference implementation set
   `enableDensityToggle: true` but forced cell padding with `!important`, so the
   affordance did nothing (noted in `research-260812-mrt-setup-audit.md` §5.2).
   Here each density maps to a distinct class set and nothing overrides it.
3. **`idPrefix`** — added. Each instance gets a stable prefix so two tables on
   one page keep distinct DOM ids.
4. **`getRowId`** — required explicitly. No `String(row.id)` default; guessing
   the key silently breaks selection on data that has no `id`.
5. **Hard-coded VI strings** — replaced by `tableLocalizationVi` plus labels
   passed through column meta.

---

## Known gaps

- **`use-data-grid.ts` is still one large file (~3.6k lines).** The store was
  extracted to `use-data-grid-store.ts`, but the ~30 interaction callbacks
  (selection, navigation, editing, clipboard, search) close over a shared set of
  refs and the store, so splitting them means threading a large context object
  through every sub-hook. The existing 114 tests do not cover auto-scroll, RTL
  navigation or drag selection, so a mechanical split carries real regression
  risk. Left intact deliberately; do it behind expanded tests.
- **`next build` crashes on a path containing non-ASCII characters.** This is a
  Turbopack bug (`turbopack-core/src/ident.rs` slices by byte index and panics
  mid-UTF-8), not a project issue. Verified by building the same tree from an
  ASCII path — clean. Keep the checkout under an ASCII path.

---

## Verification

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm build
pnpm build:registry
```

```bash
pnpm dev
```

No `.env`, no Docker, no database. Then check:

| Route | Expected |
|---|---|
| `/employees` | 19 columns; click a row → detail panel updates; settings sheet reorders / resizes / pins / hides columns and survives reload; infinite-scroll toggle loads more on scroll |
| `/` | Filter + sort + paginate over mock data; advanced filter builder; row selection → action bar |
| `/data-grid` | Edit cells, range copy/paste, Ctrl+Z, Ctrl+F, add/delete rows, RTL toggle |
| `/data-grid-live` | Optimistic CRUD, and **no** request to `/api/skaters` in the Network tab |
| `/data-grid-multiplayer` | Two tabs show each other's presence cursors |

```bash
grep -rn "@/db\|drizzle-orm\|uploadthing\|@upstash" src/ next.config.ts
```

Expected: no matches.

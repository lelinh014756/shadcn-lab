# [tablecn](https://tablecn.com)

Data table and data grid components built with shadcn/ui, featuring sorting, filtering, pagination, infinite scrolling, and real-time collaboration.

[![tablecn](./public/images/screenshot.png)](https://tablecn.com)

## Documentation

See the [documentation](https://diceui.com/docs/components/data-table) to get started.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Table:** [TanStack Table](https://tanstack.com/table/latest)
- **Reactive store:** [TanStack DB](https://tanstack.com/db/latest)
- **Data:** in-memory mock layer (`src/mocks/`) — no database required
- **Validation:** [Zod](https://zod.dev)
- **Multiplayer:** [PartyKit](https://partykit.io)

## Architecture

The table components follow the layering Material React Table uses. The table
instance is the only transport — renderers, slot props and localization all ride
on `table.options`, so a renderer takes a single prop:

```tsx
<DataTable table={table} />
<DataGrid table={table} />
```

```
Screen        compose data + settings + table
Feature hook  columns + option overrides
Stack hook    useDataTable / useDataGrid
Core          useTableCore — defaults, display columns, extra state
Renderer      <DataTable /> / <DataGrid />
```

See [`plans/260812-2307-mrt-to-tablecn-mapping/plan.md`](plans/260812-2307-mrt-to-tablecn-mapping/plan.md)
for the full mapping.

## Features

- [x] Pagination, sorting, and filtering
- [x] Customizable columns
- [x] Auto generated filters from column definitions
- [x] `Notion/Airtable` like advanced filtering
- [x] `Linear` like filter menu for command palette filtering
- [x] Action bar on row selection
- [x] Infinite scrolling with virtualization
- [x] Real-time collaboration
- [x] Column settings sheet — drag to reorder, resize, pin, hide (persisted)
- [x] Density and fullscreen toggles
- [x] Localization (EN / VI)

## Running Locally

No database, no Docker, no environment variables — all demos run on an in-memory
mock layer.

```bash
git clone https://github.com/sadmann7/tablecn
cd tablecn
pnpm install
pnpm dev
```

Then open <http://localhost:3006>.

> **Note:** keep the checkout under a path with no accented characters.
> Turbopack panics on non-ASCII project paths
> ([`turbopack-core/src/ident.rs`](https://github.com/vercel/next.js) slices by
> byte index), which breaks `next build` and some routes in `next dev`.

### Multiplayer

To run the multiplayer demo locally:

```bash
pnpm dev:multiplayer
```

This starts both the Next.js and PartyKit dev servers concurrently.

## Deployment

Follow the deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify), and [Docker](https://create.t3.gg/en/deployment/docker).

The multiplayer demo uses [PartyKit](https://partykit.io) as a separate deployment:

```bash
pnpm deploy:multiplayer
```

Set `NEXT_PUBLIC_PARTYKIT_HOST` in your deployment environment variables after deploying.

## Credits

- [shadcn/ui](https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(app)/examples/tasks) - For the initial implementation of the data table.

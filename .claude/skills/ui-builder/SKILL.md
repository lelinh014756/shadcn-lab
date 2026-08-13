---
name: ui-builder
description: Hub skill for building Next.js 16 UI (components, pages, modules). Delegates to frontend-design (visual), ui-styling (shadcn/TW), react-best-practices (perf), ui-ux-pro-max (design intelligence). Use for components, pages, layouts, data fetching, routing, forms, i18n.
argument-hint: "[component or feature]"
metadata:
  version: "3.0.0"
---

# UI Builder — Hub Skill

Core skill for implementing UI in this Next.js 16 App Router project. Acts as hub — delegates to spoke skills when specialized input is needed.

**File Read Policy:** Don't re-read unchanged files. Delegate to subagent → embed content in prompt.

## When to Use

- Creating pages, layouts, components in `src/app/` or `src/modules/`
- Building module features (dashboard, projects, auth, etc.)
- Implementing data fetching patterns (Server Components, client fetch)
- Routing with Next.js App Router conventions
- Form handling, i18n integration, shared component reuse

---

## Quick Start

### New Component Checklist

- [ ] Regular function, NOT `React.FC`
- [ ] Type props with `type Props = { ... }` at top
- [ ] Use `cn()` from `@/lib/utils` for conditional classes
- [ ] Import UI primitives from `@/components/ui/*`
- [ ] Import icons from `lucide-react`
- [ ] `"use client"` only when needing state, effects, or browser APIs
- [ ] Use `sonner` (`toast()`) for notifications, NOT custom snackbars

### New Page Checklist

- [ ] Page file at `src/app/(dashboard)/{route}/page.tsx` or `src/app/(public)/`
- [ ] Server Component by default (no `"use client"`)
- [ ] Push logic to `src/modules/{module}/components/`
- [ ] Wrap in `AppCard`, use `PageHeader` from `@/components/layout/`
- [ ] Handle loading via `loading.tsx`, errors via `error.tsx`

### New Module Checklist

- [ ] Directory at `src/modules/{module-name}/`
- [ ] Subdirs: `components/`, `hooks/`, `helpers/`, `types/`
- [ ] Export public API from `index.ts`
- [ ] Import with `@/modules/{module-name}/...` or relative

---

## Common Imports

```typescript
// UI primitives
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/ui-elements/app-card";
import { MetricCard } from "@/components/ui-elements/metric-card";

// Layout
import { PageHeader } from "@/components/layout/page-header";

// Shared components
import { AdminDataGrid } from "@/components/data-table/admin-data-grid";
import { useAdminTable } from "@/lib/hooks/use-admin-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingBlock } from "@/components/feedback/loading-block";
import { StatusBadge } from "@/components/feedback/status-badge";

// Utilities
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";

// Icons
import { Search, Plus, ChevronDown } from "lucide-react";

// Notifications
import { toast } from "sonner";
```

---

## Topic Guides

| Need to... | Read this resource |
|------------|-------------------|
| Create components | [component-patterns.md](resources/component-patterns.md) |
| Organize modules | [file-organization.md](resources/file-organization.md) |
| Set up routes | [routing-guide.md](resources/routing-guide.md) |
| Fetch data | [data-fetching.md](resources/data-fetching.md) |
| Handle loading/errors | [loading-and-error-states.md](resources/loading-and-error-states.md) |
| Forms, tables, badges, i18n | [common-patterns.md](resources/common-patterns.md) |
| TypeScript standards | [typescript-standards.md](resources/typescript-standards.md) |
| **Project UI rules** (admin patterns, ownership, tokens, breakpoints, typography) | [design-guidelines.md](../../../docs/design-guidelines.md) |
| **Form system** (select decisions, sizing, validation) | [form-system.md](../../../docs/design/form-system.md) |
| **Button tone contract** (toolbar, dialog, row actions) | [button-tone-contract.md](../../../docs/design/button-tone-contract.md) |
| **Feedback architecture** (alert, toast, CRUD notifications) | [feedback-architecture.md](../../../docs/design/feedback-architecture.md) |

> **Project-specific rules override generic patterns above.** When building UI for this project, read the project design docs first — they define actual component ownership, admin layout chain, and tone contracts.

---

## Core Principles

1. **Server Components first** — default in App Router, add `"use client"` only when needed
2. **Regular functions** — NOT `React.FC<Props>`, use `type Props` + `function Component()`
3. **Tailwind + cn()** — utility classes with `cn()` for conditionals, no inline styles
4. **shadcn/ui primitives** — import from `@/components/ui/*`, don't reinvent
5. **Module-first** — domain logic in `src/modules/*`, shared in `src/components/*`
6. **`@/` alias only** — no `~features`, `~components` etc.
7. **sonner for toasts** — `toast.success()`, `toast.error()`
8. **i18n via `useT()`** — `const { dict } = useT()` for translations

---

## Component Template

```typescript
import { cn } from "@/lib/utils";

type MyComponentProps = {
  title: string;
  isActive?: boolean;
  className?: string;
  onAction?: () => void;
};

export function MyComponent({ title, isActive, className, onAction }: MyComponentProps) {
  return (
    <div className={cn("rounded-md border border-gray-200 bg-white p-6", className)}>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {isActive && <span className="text-xs text-green-600">Active</span>}
    </div>
  );
}
```

---

## Spoke Delegation

Hub role: `ui-builder` handles coding implementation. Delegate to spoke skills when specific conditions met.

### Decision Flow

```
Input type?
├── Screenshot/mockup/video ──→ activate frontend-design FIRST (visual analysis)
│                                then ui-builder implements
├── Spec/text description ────→ ui-builder directly, delegate on-demand
└── Bug fix / refactor ───────→ ui-builder directly, skip all spokes
    │
    └── During implementation, need:
        ├── shadcn component details? ──→ ui-styling (read reference only)
        ├── Perf concern detected? ─────→ react-best-practices (read specific rule)
        ├── External lib API? ──────────→ docs-seeker (1 lookup, stop)
        └── Next.js config/SSR? ───────→ web-frameworks (config only)
```

### Activation Matrix

| Spoke | Trigger condition | Activation mode | Scope limit |
|---|---|---|---|
| `frontend-design` | Input = screenshot/mockup/video | **Full activate** | Design phase only, then hand off to ui-builder |
| `ui-styling` | Need shadcn component API or theme config | **Read reference** | Only `references/` section needed |
| `react-best-practices` | Perf issue detected (waterfall, bundle, re-render) | **Read specific rule** | Single rule file, not full skill |
| `ui-ux-pro-max` | See dedicated section below | **Script only** | `search.py` output, never full skill |
| `docs-seeker` | Need external lib API reference | **1 lookup** | Single query, stop |
| `web-frameworks` | Next.js config, SSR/ISR, Turborepo | **Read relevant section** | Config-specific only |

### ui-ux-pro-max: Narrow Activation

**NEVER activate full skill.** Only use `search.py` for targeted lookups:

```bash
# DO: specific lookup, scoped output
.claude/skills/.venv/Scripts/python.exe .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>

# DON'T: full activation — 600+ lines SKILL.md will explode context
```

| When | Command |
|---|---|
| Need color palette | `search.py "saas dashboard modern" --domain color -n 3` |
| Need font pairing | `search.py "professional clean" --domain typography -n 3` |
| Need UX rule check | `search.py "form loading accessibility" --domain ux -n 5` |
| New page design system | `search.py "<product> <industry>" --design-system -p "<Page>"` |
| Chart type decision | `search.py "trend comparison" --domain chart -n 3` |

**Rule:** Only capture script output. Never read full `ui-ux-pro-max/SKILL.md` unless user explicitly requests design intelligence review.

### Core Rule

**Hub always stays in control.** Spoke skills provide input; hub implements. Never chain more than 1 spoke per task step.

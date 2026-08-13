# File Organization

Module-first structure for Next.js App Router project.

---

## Top-Level Structure

```
src/
  app/              ← Routes, layouts, pages (Next.js App Router)
  modules/          ← Domain logic & components per business area
  components/       ← Shared UI across modules
  lib/              ← Utilities, configs, i18n
  context/          ← React Context providers
  types/            ← Shared TypeScript types
  store/            ← Global state (if needed)
```

---

## modules/ (Domain Logic)

Each business domain has its own module:

```
src/modules/
  auth/
    components/       ← login-form, auth-input, auth-checkbox
    hooks/            ← use-login-form
    helpers/
    types/
    index.ts          ← Public exports
  dashboard/
  projects/
  products/
  transactions/
  finance/
  reports/
  settings/
```

### Module Subdirectories

| Dir | Purpose | When to Create |
|-----|---------|---------------|
| `components/` | Module-specific UI | Always |
| `hooks/` | Custom hooks | When logic is reusable |
| `helpers/` | Utilities, formatters | When >2 utility functions |
| `types/` | TypeScript types | When types are complex |
| `index.ts` | Public API barrel | Always |

### Module index.ts Pattern

```typescript
// src/modules/auth/index.ts
export { LoginForm } from "./components/login-form";
export { useLoginForm } from "./hooks/use-login-form";
export type { LoginValues, LoginErrors } from "./types";
```

---

## components/ (Shared UI)

```
src/components/
  ui/               ← shadcn/ui primitives + wrappers
    button.tsx
    card.tsx
    app-card.tsx    ← App-specific wrapper
    metric-card.tsx ← Dashboard KPI (MetricCard)
    badge.tsx
    dialog.tsx
    table.tsx
    ...
  common/           ← Shared compound components
    data-table.tsx  ← Generic table with loading/empty states
    empty-state.tsx
    loading-block.tsx
    status-badge.tsx
    filter-bar.tsx
    language-switcher.tsx
  layout/           ← App shell components
    app-header.tsx
    app-sidebar.tsx
    page-header.tsx
    user-menu.tsx
    backdrop.tsx
  icons/            ← SVG icons (inline)
    index.tsx
  dashboard/        ← Dashboard-specific widgets
```

---

## Import Conventions

```typescript
// Only @/ alias — no ~features, ~components etc.
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/ui/app-card";
import { useLoginForm } from "@/modules/auth/hooks/use-login-form";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
```

---

## Import Order

```typescript
// 1. React / Next.js
import { useState, useCallback } from "react";
import Link from "next/link";

// 2. Third-party (lucide-react, sonner, recharts)
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";

// 3. @/ aliases
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/ui/app-card";

// 4. Relative (within same module)
import { useLoginForm } from "../hooks/use-login-form";
import type { LoginFormValues } from "../types";
```

---

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | kebab-case.tsx | `login-form.tsx`, `metric-card.tsx` |
| Hooks | kebab-case.ts | `use-login-form.ts` |
| Helpers | kebab-case.ts | `format-currency.ts` |
| Types | kebab-case.ts or index.ts | `index.ts`, `auth-types.ts` |
| Pages | page.tsx (Next.js) | `page.tsx` |
| Layouts | layout.tsx (Next.js) | `layout.tsx` |
| Configs | kebab-case.ts | `status-config.ts` |

---

## When to Create New Module

Create when: >3 related components, own API endpoints, domain-specific logic, will grow independently.
Add to existing when: related to existing feature, shares data context, extends functionality.

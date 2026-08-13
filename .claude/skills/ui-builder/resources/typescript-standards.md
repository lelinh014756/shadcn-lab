# TypeScript Standards

TypeScript conventions for this Next.js project.

---

## Strict Mode

Project uses `"strict": true` in tsconfig. No `any` types.

---

## Component Props

Use `type` (not `interface`) for component props:

```typescript
// ✅ Preferred
type Props = {
  title: string;
  count?: number;
  onSelect?: (id: string) => void;
  className?: string;
};

// ❌ Avoid for component props
interface Props { ... }
```

**Why:** Consistency — all existing components use `type`. Lighter syntax for unions/intersections.

---

## Type Imports

Use `import type` for type-only imports:

```typescript
import type { Project } from "@/types";
import type { MRT_ColumnDef } from "material-react-table";
```

---

## Generic Components

```typescript
type AdminDataGridProps<TData extends Record<string, any>> = {
  table: MRT_TableInstance<TData>;
  className?: string;
};

export function AdminDataGrid<TData extends Record<string, any>>({ table, className }: AdminDataGridProps<TData>) {
  // ...
}
```

---

## API Response Types

Define in module `types/` directory:

```typescript
// src/modules/projects/types/index.ts
export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
};

export type ProjectStatus = "active" | "completed" | "on_hold" | "cancelled";

export type ProjectsResponse = {
  data: Project[];
  total: number;
  page: number;
};
```

---

## Event Handler Types

```typescript
// Form inputs
type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

// Buttons
type ClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

// Or inline
onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
```

---

## Utility Types

```typescript
// Partial for updates
type UpdatePayload = Partial<Omit<Project, "id" | "createdAt">>;

// Pick for specific fields
type ProjectSummary = Pick<Project, "id" | "name" | "status">;

// Record for maps
type StatusMap = Record<ProjectStatus, { label: string; color: string }>;
```

---

## Return Types

Explicit return types on exported functions. Inferred is fine for internal helpers.

```typescript
// Exported — explicit return type
export function formatCurrency(amount: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);
}

// Internal — inferred is fine
const isActive = (status: ProjectStatus) => status === "active";
```

---

## Module Type Exports

```typescript
// src/modules/projects/index.ts
export { ProjectList } from "./components/project-list";
export { useProjects } from "./hooks/use-projects";
export type { Project, ProjectStatus } from "./types";
```

Barrel exports keep module API clean and stable.

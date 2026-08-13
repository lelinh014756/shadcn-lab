# Component Patterns

Component architecture for Next.js 16 App Router + Tailwind CSS + shadcn/ui.

---

## Function Declaration (PREFERRED)

Regular named function with separate type alias:

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
    <div className={cn("rounded-md border bg-white p-6", className)}>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}
```

**NOT:** `React.FC<Props>` — only 3 of 61 files use it. Regular functions are the project standard.

---

## Client vs Server Components

### Server Component (default)

```typescript
// src/app/(dashboard)/projects/page.tsx
// No "use client" — runs on server
import { AppCard } from "@/components/ui/app-card";

export default function ProjectsPage() {
  return <AppCard title="Projects">...</AppCard>;
}
```

### Client Component (opt-in)

```typescript
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**When to use `"use client"`:**
- useState, useEffect, useRef, useCallback, useMemo
- Browser APIs (window, document, localStorage)
- Event handlers on elements
- React Context providers/consumers

---

## Component Structure

```typescript
// 1. "use client" directive (only when needed)
"use client";

// 2. Imports
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// 3. Types
type Props = {
  id: string;
  onSaved?: () => void;
};

// 4. Component
export function EditPanel({ id, onSaved }: Props) {
  // hooks
  const [value, setValue] = useState("");

  // handlers
  const handleSave = useCallback(() => {
    toast.success("Saved");
    onSaved?.();
  }, [onSaved]);

  // render
  return (
    <div className="space-y-4">
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
}
```

---

## Conditional Classes with cn()

```typescript
import { cn } from "@/lib/utils";

// Merge base + conditional
<div className={cn(
  "rounded-md border p-4",
  isActive && "border-green-500 bg-green-50",
  isDisabled && "opacity-50 cursor-not-allowed",
  className,
)} />
```

**Rules:**
- Always spread `className` prop last so caller can override
- Use `cn()` for all conditional class logic, NOT template literals
- Import from `@/lib/utils`

---

## Component Splitting

**Split when:** >200 LOC, multiple responsibilities, reusable sections.

**Keep together when:** <200 LOC, tightly coupled, simple presentation.

---

## Export Patterns

```typescript
// Named export (preferred for module components)
export function MyComponent() { ... }

// Default export (for page.tsx entries)
export default function ProjectsPage() { ... }

// Barrel export (module index.ts)
export { MyComponent } from "./components/my-component";
```

# Routing Guide

Next.js 16 App Router conventions used in this project.

---

## Route Structure

```
src/app/
  layout.tsx                    ← Root layout (fonts, providers)
  page.tsx                      ← / (redirect or landing)
  not-found.tsx                 ← Global 404
  global-error.tsx              ← Global error boundary
  (public)/
    layout.tsx                  ← Public layout (no sidebar)
    auth/
      login/page.tsx            ← /auth/login
      error.tsx                 ← Auth error boundary
      not-found.tsx
  (dashboard)/
    layout.tsx                  ← Dashboard layout (sidebar + header)
    dashboard/page.tsx          ← /dashboard
    projects/page.tsx           ← /projects
    products/page.tsx           ← /products
    transactions/page.tsx       ← /transactions
    finance/page.tsx            ← /finance
    reports/page.tsx            ← /reports
    settings/page.tsx           ← /settings
    crm/page.tsx                ← /crm
    dev/ui/page.tsx             ← /dev/ui (UI playground)
```

**Route groups:** `(public)` and `(dashboard)` are route groups — affect layout, not URL.

---

## Page Pattern

Pages are Server Components by default. Keep thin — push logic to modules.

```typescript
// src/app/(dashboard)/projects/page.tsx
import { PageHeader } from "@/components/layout/page-header";
import { AppCard } from "@/components/ui/app-card";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Projects" />
      <AppCard title="Project List">
        {/* Module components here */}
      </AppCard>
    </div>
  );
}
```

---

## Layout Pattern

Layouts wrap child routes. Dashboard layout includes sidebar + header:

```typescript
// src/app/(dashboard)/layout.tsx
"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/components/layout/app-header";
import AppSidebar from "@/components/layout/app-sidebar";
import Backdrop from "@/components/layout/backdrop";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "md:ml-[var(--sidebar-width)]"
      : "md:ml-[var(--sidebar-collapsed-width)]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainMargin}`}>
        <AppHeader />
        <div className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-4 pt-2 md:px-6 md:pb-6 md:pt-3">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## Error & Loading States

Error: `error.tsx` per route (see [loading-and-error-states.md](loading-and-error-states.md)).
Loading: `loading.tsx` per route using `LoadingBlock`.

---

## Navigation

```typescript
import Link from "next/link";
import { useRouter } from "next/navigation";

<Link href="/projects">Projects</Link>           // declarative
const router = useRouter(); router.push("/projects"); // programmatic (client only)
```

---

## Dynamic Routes

```
src/app/(dashboard)/projects/[id]/page.tsx
```

```typescript
export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <div>Project {params.id}</div>;
}
```

# Data Fetching

Patterns for fetching data in Next.js 16 App Router.

---

## Strategy Overview

| Scenario | Pattern | Location |
|----------|---------|----------|
| Page data (read) | Server Component + `fetch` | `page.tsx` |
| Interactive data (filters, search) | Client Component + fetch OR TanStack | Module component |
| Mutations (create, update, delete) | Server Actions OR client fetch | Module hooks |
| Real-time data | Polling or WebSocket | Client component |
| Complex cache needs | TanStack Query | Module hooks |

---

## Server Component Fetch (Preferred)

Default approach — no client JS, no loading states needed:

```typescript
// src/app/(dashboard)/projects/page.tsx
import { AppCard } from "@/components/ui/app-card";

async function getProjects() {
  const res = await fetch("https://api.example.com/projects", {
    next: { revalidate: 300 }, // ISR: revalidate every 5 min
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <AppCard title="Projects">{/* render projects */}</AppCard>;
}
```

**Benefits:** Zero client JS, streaming, automatic deduplication.

---

## Client-Side Fetch (When Interactive)

When page needs filters, search, pagination controlled by user:

```typescript
"use client";

import { useState, useEffect } from "react";
import { LoadingBlock } from "@/components/feedback/loading-block";
import { EmptyState } from "@/components/feedback/empty-state";

type Project = { id: string; name: string };

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingBlock rows={5} />;
  if (error) return <EmptyState title="Error" description={error} />;
  if (!projects.length) return <EmptyState title="No projects" />;

  return (
    <ul>{projects.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
  );
}
```

---

## Server Actions (Mutations)

```typescript
// src/modules/projects/actions.ts
"use server";

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  // validate + save
}

// In component
import { createProject } from "@/modules/projects/actions";

<form action={createProject}>
  <input name="name" />
  <button type="submit">Create</button>
</form>
```

---

## Fetch Configuration

```typescript
// Caching strategies
fetch(url, { cache: "force-cache" });        // Static (default)
fetch(url, { cache: "no-store" });           // Always fresh
fetch(url, { next: { revalidate: 300 } });   // ISR: 5 min
fetch(url, { next: { tags: ["projects"] } }); // On-demand revalidation
```

---

## TanStack Query (Complex Cases)

### When to Add @tanstack/react-query

Consider adding TanStack Query when:
- Infinite scroll / cursor pagination
- Complex cache invalidation across views
- Optimistic updates (immediate UI feedback)
- Background refetch with stale-while-revalidate
- Real-time data (polling)

**Default:** Server Components + fetch is simpler and sufficient.

### Setup (if not installed)

```bash
pnpm add @tanstack/react-query
```

```typescript
// app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,  // 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

---

## Query Key Organization

```typescript
// Entity list
['projects']
['projects', filters]
['projects', filters, 'page', page]

// Single entity
['project', id]

// Related data
['project', id, 'comments']
['project', id, 'history']

// User-specific
['user', userId, 'profile']
['user', userId, 'permissions']
```

**Rules:**
- Plural for lists, singular for one
- Include IDs for specificity
- Add filters/view mode at end

---

## Cache-First Strategy

When using TanStack Query, check cache before fetch to reduce API calls:

```typescript
async function getProject(id: string, queryClient: QueryClient) {
  // 1. Check list cache first (common pattern)
  const cachedList = queryClient.getQueryData<Project[]>(['projects']);
  if (cachedList) {
    const found = cachedList.find(p => p.id === id);
    if (found) return found;
  }

  // 2. Not in cache, fetch
  const res = await fetch(`/api/projects/${id}`);
  return res.json();
}
```

**When to use:**
- Data commonly appears in list queries
- Reducing API calls is important
- Cache is likely to have the data

---

## Parallel Queries

### Promise.all (Server Components)

```typescript
// Fetch independent data in parallel
const [projects, users] = await Promise.all([
  fetch('/api/projects').then(r => r.json()),
  fetch('/api/users').then(r => r.json()),
]);
```

### useSuspenseQueries (Client Components)

```typescript
"use client";

import { useSuspenseQueries } from "@tanstack/react-query";

export function useDashboard() {
  const [projectsQuery, statsQuery, notificationsQuery] = useSuspenseQueries({
    queries: [
      { queryKey: ['projects'], queryFn: () => fetch('/api/projects').then(r => r.json()) },
      { queryKey: ['stats'], queryFn: () => fetch('/api/stats').then(r => r.json()) },
      { queryKey: ['notifications'], queryFn: () => fetch('/api/notifications').then(r => r.json()) },
    ],
  });

  return {
    projects: projectsQuery.data,
    stats: statsQuery.data,
    notifications: notificationsQuery.data,
  };
}
```

---

## Optimistic Updates

Cập nhật UI immediately trước khi server response:

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      fetch(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }).then(r => r.json()),

    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["project", id] });

      // Snapshot current value
      const previous = queryClient.getQueryData(["project", id]);

      // Optimistically update
      queryClient.setQueryData(["project", id], (old: Project) => ({
        ...old,
        ...data,
      }));

      return { previous };
    },

    onError: (err, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(["project", id], context?.previous);
    },

    onSettled: ({ id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Usage
const updateProject = useUpdateProject();
<Button
  onClick={() => updateProject.mutate({ id: "1", data: { name: "Updated" } })}
  disabled={updateProject.isPending}
>
  Save
</Button>
```

---

## Mutations

### Update Mutation

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) =>
      fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }).then(r => r.json()),

    onSuccess: () => {
      toast.success("Project created");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },

    onError: () => {
      toast.error("Failed to create project");
    },
  });
}
```

### Delete Mutation

```typescript
"use client";

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/projects/${id}`, { method: "DELETE" }).then(r => r.json()),

    onSuccess: () => {
      toast.success("Project deleted");
      // Optimistically remove from cache
      queryClient.setQueryData(["projects"], (old: Project[]) =>
        old?.filter(p => p.id !== id)
      );
    },

    onError: () => {
      toast.error("Failed to delete project");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

---

## Dependent Queries

Query B chờ query A xong mới fetch:

```typescript
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

// Query A: User (load first)
const { data: user } = useSuspenseQuery({
  queryKey: ["user", userId],
  queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
});

// Query B: User's settings (depends on user)
const { data: settings } = useSuspenseQuery({
  queryKey: ["user", userId, "settings"],
  queryFn: () => fetch(`/api/users/${userId}/settings`).then(r => r.json()),
  // enabled: only fetch when user is loaded
  enabled: !!user,
});
```

---

## Infinite Scroll

```typescript
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

async function fetchProjects({ pageParam = 0 }: { pageParam?: number }) {
  const res = await fetch(`/api/projects?cursor=${pageParam}&limit=20`);
  return res.json();
}

export function useProjectsInfinite() {
  return useInfiniteQuery({
    queryKey: ["projects", "infinite"],
    queryFn: fetchProjects,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

// Usage
export function ProjectList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProjectsInfinite();

  return (
    <div>
      {data?.pages.map(page =>
        page.items.map(project => <ProjectCard key={project.id} {...project} />)
      )}
      <Button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? "Loading..." : "Load More"}
      </Button>
    </div>
  );
}
```

---

## Error Handling

```typescript
// Server component — error.tsx catches this
if (!res.ok) throw new Error("Failed to fetch");

// Client component — handle inline
try {
  const data = await fetch(url);
} catch (e) {
  setError(e instanceof Error ? e.message : "Unknown error");
}

// TanStack Query error boundaries
<ErrorBoundary
  fallback={<ErrorDisplay message="Failed to load" />}
  onError={(error) => console.error(error)}
>
  <Suspense fallback={<LoadingBlock />}>
    <ProjectList />
  </Suspense>
</ErrorBoundary>
```

---

## Summary

| Pattern | Use Case |
|---------|----------|
| Server Component + fetch | Default, most cases |
| Client fetch | Simple interactive (filters) |
| Server Actions | Form submissions |
| TanStack Query | Complex cache, optimistic updates, infinite scroll |
| Promise.all / useSuspenseQueries | Parallel independent fetches |

**Rule:** Start simple with Server Components. Add complexity (TanStack) only when needed.

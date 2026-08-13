# Loading & Error States

Patterns for handling loading, empty, and error states using project's shared components.

---

## Shared Components

| Component | Import | Purpose |
|-----------|--------|---------|
| `LoadingBlock` | `@/components/feedback/loading-block` | Skeleton loading placeholder |
| `EmptyState` | `@/components/feedback/empty-state` | No data available |
| `error.tsx` | Next.js convention | Error boundary per route |

---

## LoadingBlock

Skeleton placeholder with configurable rows:

```typescript
import { LoadingBlock } from "@/components/feedback/loading-block";

// Basic usage
<LoadingBlock rows={5} className="p-6" />

// Inside AppCard
<AppCard title="Projects">
  <LoadingBlock rows={8} />
</AppCard>
```

**Props:**
- `rows?: number` — number of skeleton bars (default 3)
- `className?: string` — additional classes

---

## EmptyState

Centered empty message with optional action:

```typescript
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

<EmptyState
  title="Không có dự án"
  description="Bạn chưa tạo dự án nào. Bắt đầu ngay."
  icon={<FolderIcon className="size-12" />}
  action={<Button onClick={handleCreate}>Tạo dự án</Button>}
/>
```

**Props:**
- `title: string` — required
- `description?: string`
- `icon?: ReactNode`
- `action?: ReactNode`
- `className?: string`

---

## Error Boundaries (Next.js)

### Route-level error.tsx

```typescript
// src/app/(dashboard)/projects/error.tsx
"use client";

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h2 className="text-lg font-semibold text-gray-900">Đã xảy ra lỗi</h2>
      <p className="mt-2 text-sm text-gray-500">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white">
        Thử lại
      </button>
    </div>
  );
}
```

### Global error boundary

Already exists at `src/app/global-error.tsx` — catches unhandled errors.

---

## Route-level loading.tsx

```typescript
// src/app/(dashboard)/projects/loading.tsx
import { LoadingBlock } from "@/components/feedback/loading-block";

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <LoadingBlock rows={1} className="h-10" />
      <LoadingBlock rows={8} className="p-6" />
    </div>
  );
}
```

---

## Pattern: AdminDataGrid with All States

`useAdminTable` + `AdminDataGrid` handles loading + empty + pagination:

```typescript
import { useAdminTable } from "@/lib/hooks/use-admin-table";
import { AdminDataGrid } from "@/components/data-table/admin-data-grid";
import { EmptyState } from "@/components/feedback/empty-state";

const table = useAdminTable({
  columns,
  data,
  getRowId: (row) => row.id,
  renderEmptyRowsFallback: () => <EmptyState title="Không có dữ liệu" />,
});

<AdminDataGrid table={table} />
```

---

## Decision Flow

- **Loading:** Server page → `loading.tsx` | Client → `LoadingBlock` | DataTable → `isLoading` prop
- **Empty:** Standalone → `EmptyState` | DataTable → `emptyTitle`/`emptyDescription` props
- **Error:** Route → `error.tsx` | Client → try/catch | Server → throw (caught by `error.tsx`)

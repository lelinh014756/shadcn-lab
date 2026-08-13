# Common Patterns

Frequently used patterns: forms, DataTable, StatusBadge, i18n, notifications.

---

## Forms (Custom Hook Pattern)

Project uses custom form hooks (no React Hook Form yet). See `src/modules/auth/hooks/use-login-form.ts` for full example.

Pattern: `useState` for values/errors/touched/loading, `useCallback` for handlers, return all state + setters.

```typescript
type FormValues = { email: string; password: string; rememberMe: boolean };
export function useLoginForm() {
  const [values, setValues] = useState<FormValues>({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  // ... validation + submit logic
  return { values, errors, isLoading, setValue, handleSubmit };
}
```

---

## AdminDataGrid (MRT)

```typescript
import { AdminDataGrid } from "@/components/data-table/admin-data-grid";
import { useAdminTable } from "@/lib/hooks/use-admin-table";
import { type MRT_ColumnDef } from "material-react-table";

const columns: MRT_ColumnDef<MyType>[] = [
  { accessorKey: "name", header: "Tên" },
  { accessorKey: "status", header: "Trạng thái", Cell: ({ cell }) => <StatusBadge status={cell.getValue<string>()} label={statusLabel(cell.getValue<string>())} /> },
];

const table = useAdminTable<MyType>({
  columns,
  data,
  getRowId: (row) => row.id,
  renderRowActions: ({ row }) => <Button variant="ghost" size="sm" onClick={() => edit(row.original.id)}>Sửa</Button>,
});

<AdminDataGrid table={table} />
```

---

## StatusBadge

```typescript
import { StatusBadge } from "@/components/feedback/status-badge";
<StatusBadge status={project.status} label={project.statusLabel} />
```

Mapping: `getStatusClasses()` in `src/lib/configs/status-config.ts`.

---

## i18n (useT Hook)

```typescript
"use client";

import { useT } from "@/lib/i18n/context";

export function MyComponent() {
  const { dict } = useT();

  return (
    <div>
      <h1>{dict.dashboard.title}</h1>
      <p>{dict.dashboard.description}</p>
    </div>
  );
}
```

**Locale files:** `src/lib/i18n/dictionaries/` (vi.ts, en.ts)
**Switcher:** `<LanguageSwitcher />` component
**Cookie:** `NEXT_LOCALE` persists selection

---

## Notifications (sonner)

```typescript
import { toast } from "sonner";

// Success
toast.success("Dự án đã được tạo");

// Error
toast.error("Không thể lưu thay đổi");

// With action
toast("Xóa dự án?", {
  action: { label: "Xóa", onClick: () => handleDelete() },
});

// Promise
toast.promise(saveProject(data), {
  loading: "Đang lưu...",
  success: "Đã lưu thành công",
  error: "Lưu thất bại",
});
```

**NOT:** useMuiSnackbar, react-toastify, or custom notification system.

---

## AppCard & MetricCard

```typescript
import { AppCard } from "@/components/ui-elements/app-card";
import { MetricCard } from "@/components/ui-elements/metric-card";

// Content card
<AppCard title="Tiêu đề" actions={<Button>Thêm</Button>}>
  {children}
</AppCard>

// KPI metric card
<MetricCard
  tone="collected"
  title="Tổng thu"
  value="36.2 tỷ"
  icon={<Wallet />}
  sparkline={[21, 24, 26, 30, 32, 36]}
  delta={<span className="text-[var(--color-success-text)]">+14%</span>}
/>
```

---

## PageHeader & Layouts

```typescript
import { PageHeader } from "@/components/layout/page-header";
<PageHeader title="Dự án" />

// Responsive grid
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => <Card key={item.id} />)}
</div>

// Flex layout
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <h2>Title</h2>
  <div className="flex gap-2">Actions</div>
</div>
```

"use client";

/**
 * Form lọc nhân viên, render bên trong <TableFilters>.
 *
 * Không tự vẽ nút Áp dụng/Xoá — hai nút đó nằm ở footer của sheet:
 *   - "Áp dụng" submit form này qua thuộc tính HTML `form={formId}`
 *   - "Xoá bộ lọc" gọi handler mà form đăng ký qua `registerReset`
 *
 * Form được unmount khi sheet đóng (xem `TableFilters`), nên `defaultValues`
 * luôn phản ánh filter đang áp dụng mỗi lần mở lại — không cần effect reset.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useTableFilters } from "@/components/table/table-filters";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departments, organizations, staffStatuses } from "@/mocks/employees";

export const EMPLOYEES_FILTER_FORM_ID = "employees-filter-form";

/** Giá trị sentinel cho mục "Tất cả" — <Select> của Radix không nhận value rỗng. */
const ALL = "all";

const employeesFilterSchema = z.object({
  org: z.number().nullable(),
  dept: z.number().nullable(),
  status: z.number().nullable(),
  active: z.boolean().nullable(),
});

export type EmployeesFilterValues = z.infer<typeof employeesFilterSchema>;

export const EMPTY_EMPLOYEES_FILTERS: EmployeesFilterValues = {
  org: null,
  dept: null,
  status: null,
  active: null,
};

/** `staffStatuses` dùng key `label`, quy về chung một hình dạng với các lookup khác. */
const STATUS_OPTIONS = staffStatuses.map((status) => ({
  id: status.id,
  name: status.label,
}));

/** Các key được tính vào badge đếm trên nút bộ lọc. */
export const EMPLOYEES_FILTER_KEYS = Object.keys(
  EMPTY_EMPLOYEES_FILTERS,
) as (keyof EmployeesFilterValues)[];

interface EmployeesFilterFormProps {
  defaultValues: EmployeesFilterValues;
}

export function EmployeesFilterForm({
  defaultValues,
}: EmployeesFilterFormProps) {
  const { formId, setOpen, onApply, registerReset } =
    useTableFilters<EmployeesFilterValues>();

  const form = useForm<EmployeesFilterValues>({
    resolver: zodResolver(employeesFilterSchema),
    defaultValues,
  });

  React.useEffect(() => {
    registerReset(() => onApply(EMPTY_EMPLOYEES_FILTERS));
    return () => registerReset(null);
  }, [registerReset, onApply]);

  const onSubmit = (values: EmployeesFilterValues) => {
    onApply(values);
    setOpen(false);
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <LookupField
          control={form.control}
          name="org"
          label="Đơn vị"
          options={organizations}
        />
        <LookupField
          control={form.control}
          name="dept"
          label="Phòng ban"
          options={departments}
        />
        <LookupField
          control={form.control}
          name="status"
          label="Tình trạng nhân viên"
          options={STATUS_OPTIONS}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className="text-xs">Trạng thái hoạt động</FormLabel>
              <Select
                value={field.value == null ? ALL : String(field.value)}
                onValueChange={(next) =>
                  field.onChange(next === ALL ? null : next === "true")
                }
              >
                <FormControl>
                  <SelectTrigger className="h-8 w-full data-size:h-8">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ALL}>Tất cả</SelectItem>
                  <SelectItem value="true">Đang hoạt động</SelectItem>
                  <SelectItem value="false">Ngưng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

interface LookupFieldProps {
  control: ReturnType<typeof useForm<EmployeesFilterValues>>["control"];
  name: "org" | "dept" | "status";
  label: string;
  options: readonly { id: number; name: string }[];
}

/** Ba select tra cứu chỉ khác nhau ở nguồn options, gom lại cho khỏi lặp. */
function LookupField({ control, name, label, options }: LookupFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="gap-1.5">
          <FormLabel className="text-xs">{label}</FormLabel>
          <Select
            value={field.value == null ? ALL : String(field.value)}
            onValueChange={(next) =>
              field.onChange(next === ALL ? null : Number(next))
            }
          >
            <FormControl>
              <SelectTrigger className="h-8 w-full data-size:h-8">
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}

"use client";

/**
 * TableFilters — nút mở bộ lọc (kèm badge đếm) + sheet chứa form lọc.
 *
 * Đừng nhầm với `TableFilterToggle`: cái đó bật/tắt hàng filter ngay trên
 * header bảng, còn cái này mở một panel riêng cho các bộ lọc cấp màn hình
 * (thường là filter gửi lên API, nằm trong URL).
 *
 * Điểm mấu chốt của thiết kế — sheet KHÔNG biết gì về schema của form:
 *
 *   1. Nút "Áp dụng" nằm ở footer, tức NGOÀI thẻ <form>. Nó submit form bằng
 *      thuộc tính HTML `form={formId}`. Nhờ vậy phần khung sheet dùng lại được
 *      cho mọi màn hình mà không cần generic hoá xuống tận nút bấm.
 *   2. Form tự đăng ký hàm reset qua `registerReset`, nút "Xoá bộ lọc" chỉ gọi
 *      lại — sheet không cần biết reset nghĩa là gì với từng màn hình.
 *   3. `{open && children}` cố ý unmount form khi đóng: lần mở sau form khởi
 *      tạo lại theo `defaultValues` mới nhất, khỏi cần effect reset thủ công.
 *
 * Usage:
 *   <TableFilters
 *     formId={EMPLOYEES_FILTER_FORM_ID}
 *     activeCount={activeFilterCount}
 *     onApply={onApplyFilters}
 *   >
 *     <EmployeesFilterForm defaultValues={appliedFilters} />
 *   </TableFilters>
 */

import { ListFilter } from "lucide-react";
import * as React from "react";
import { AppSheet } from "@/components/feedback/app-sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ─── Labels ──────────────────────────────────────────────────────────────────

export interface TableFiltersLabels {
  trigger: string;
  title: string;
  /** Dòng phụ dưới tiêu đề — AppSheet hiện ra, không phải sr-only. */
  description: string;
  apply: string;
  clear: string;
  close: string;
}

export const defaultTableFiltersLabels: TableFiltersLabels = {
  trigger: "Bộ lọc",
  title: "Bộ lọc",
  description: "Chọn điều kiện rồi bấm Áp dụng",
  apply: "Áp dụng",
  clear: "Xoá bộ lọc",
  close: "Đóng",
};

// ─── Context ─────────────────────────────────────────────────────────────────

interface TableFiltersContextValue {
  formId: string;
  setOpen: (open: boolean) => void;
  onApply: (values: Record<string, unknown>) => void;
  /** Form gọi lúc mount để nút "Xoá bộ lọc" biết phải làm gì; `null` để gỡ. */
  registerReset: (handler: (() => void) | null) => void;
}

const TableFiltersContext =
  React.createContext<TableFiltersContextValue | null>(null);

/**
 * Truyền `TValues` để form nhận `onApply` đúng kiểu.
 *
 * Context không generic được (một instance dùng chung cho mọi màn hình), nên
 * kiểu được thu hẹp ở đây — đổi lại form không phải ép kiểu ở chỗ gọi.
 */
export function useTableFilters<
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(): Omit<TableFiltersContextValue, "onApply"> & {
  onApply: (values: TValues) => void;
} {
  const context = React.useContext(TableFiltersContext);
  if (!context) {
    throw new Error("useTableFilters phải được dùng bên trong <TableFilters>");
  }
  return context;
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

function TableFiltersTrigger({
  activeCount,
  label,
  disabled,
  onClick,
}: {
  activeCount: number;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "relative size-8",
            // Đang có filter thì viền đậm lên để thấy ngay từ xa, không chỉ
            // dựa vào con số nhỏ ở góc.
            activeCount > 0 && "border-primary/50",
          )}
        >
          <ListFilter className="text-muted-foreground" />
          {activeCount > 0 && (
            <span
              aria-hidden
              className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-4xl bg-primary px-1 font-semibold text-[10px] text-primary-foreground leading-none"
            >
              {activeCount > 9 ? "9+" : activeCount}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

interface TableFiltersProps<TValues extends Record<string, unknown>> {
  /** Trùng với `id` của thẻ <form> bên trong — nút Áp dụng submit qua id này. */
  formId: string;
  /** Số filter đang bật, hiện thành badge trên nút. */
  activeCount: number;
  onApply: (values: TValues) => void;
  children: React.ReactNode;
  disabled?: boolean;
  labels?: Partial<TableFiltersLabels>;
}

export function TableFilters<TValues extends Record<string, unknown>>({
  formId,
  activeCount,
  onApply,
  children,
  disabled,
  labels: labelOverrides,
}: TableFiltersProps<TValues>) {
  const [open, setOpen] = React.useState(false);
  const resetRef = React.useRef<(() => void) | null>(null);

  const registerReset = React.useCallback((handler: (() => void) | null) => {
    resetRef.current = handler;
  }, []);

  const labels = React.useMemo(
    () => ({ ...defaultTableFiltersLabels, ...labelOverrides }),
    [labelOverrides],
  );

  const context = React.useMemo<TableFiltersContextValue>(
    () => ({
      formId,
      setOpen,
      onApply: onApply as (values: Record<string, unknown>) => void,
      registerReset,
    }),
    [formId, onApply, registerReset],
  );

  const onClear = React.useCallback(() => {
    resetRef.current?.();
    setOpen(false);
  }, []);

  return (
    <TableFiltersContext.Provider value={context}>
      <TableFiltersTrigger
        activeCount={activeCount}
        label={labels.trigger}
        disabled={disabled}
        onClick={() => setOpen(true)}
      />

      <AppSheet
        open={open}
        onOpenChange={setOpen}
        title={labels.title}
        description={labels.description}
        variant="narrow"
        bodyClassName="px-4 py-5"
        // Footer của AppSheet căn phải; ở đây cần "Xoá" dạt hẳn sang trái nên
        // tự dàn bên trong một hàng chiếm trọn chiều ngang.
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <Button variant="outline" onClick={onClear}>
              {labels.clear}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                {labels.close}
              </Button>
              {/* Nằm ngoài <form> nên phải submit qua `form={formId}`. */}
              <Button type="submit" form={formId}>
                {labels.apply}
              </Button>
            </div>
          </div>
        }
      >
        {open && children}
      </AppSheet>
    </TableFiltersContext.Provider>
  );
}

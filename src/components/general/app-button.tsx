"use client";

/**
 * AppButton — port từ Payment-DIP-web, bọc `ui/button` thêm:
 *
 *   - `loading`: khoá nút, đổi nội dung thành spinner + `loadingText`
 *     (size icon thì chỉ còn spinner, không kèm chữ).
 *   - `visual`: preset icon + màu cho các hành động lặp lại nhiều (thêm, sửa,
 *     lưu, tải lại, lọc, xuất Excel).
 *   - `color`: tô màu ngữ nghĩa, đọc kèm `variant` để ra đúng sắc độ
 *     (outline thì nền nhạt + viền, ghost thì chỉ chữ, còn lại là nền đặc).
 *   - Hiệu ứng hover: nhấc nhẹ 0.5 và một lớp sáng quét ngang.
 *
 * Icon lấy từ `lucide-react` thay cho `@hugeicons` của bản gốc — xem
 * `app-icon.tsx` để biết lý do.
 */

import type { VariantProps } from "class-variance-authority";
import { Download, Filter, Pencil, Plus, RefreshCw, Save } from "lucide-react";
import { memo } from "react";

import { AppIcon } from "@/components/general/app-icon";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type AppButtonVisual =
  | "add"
  | "edit"
  | "save"
  | "refresh"
  | "gradient"
  | "excel"
  | "filter";

export type AppButtonColor = "success" | "warning" | "destructive" | "info";

interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  visual?: AppButtonVisual;
  color?: AppButtonColor;
  asChild?: boolean;
}

const HOVER_SHEEN =
  'relative isolate cursor-pointer select-none overflow-hidden transition-all before:absolute before:top-0 before:left-0 before:-z-10 before:h-full before:w-0 before:bg-white before:opacity-10 before:transition-all before:duration-400 before:ease-[cubic-bezier(.165,.84,.44,1)] before:content-[""] hover:-translate-y-0.5 hover:before:right-0 hover:before:left-auto hover:before:w-full';

const VISUAL_CLASSES: Record<AppButtonVisual, string> = {
  add: "bg-primary text-white",
  edit: "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-950/20",
  save: "",
  gradient: "bg-gradient-to-r from-primary to-secondary text-white",
  refresh: "",
  filter: "",
  excel: "bg-green-600 text-white hover:bg-green-700",
};

const VISUAL_ICONS: Partial<Record<AppButtonVisual, React.ReactNode>> = {
  add: <AppIcon icon={Plus} />,
  edit: <AppIcon icon={Pencil} />,
  save: <AppIcon icon={Save} />,
  refresh: <AppIcon icon={RefreshCw} />,
  filter: <AppIcon icon={Filter} />,
  excel: <AppIcon icon={Download} />,
};

/** `refresh` và `filter` luôn là nút phụ, ép về outline dù caller không truyền. */
const VISUAL_FORCED_VARIANT: Partial<
  Record<AppButtonVisual, AppButtonProps["variant"]>
> = {
  refresh: "outline",
  filter: "outline",
};

const COLOR_CLASSES: Record<
  "outline" | "ghost" | "solid",
  Record<AppButtonColor, string>
> = {
  outline: {
    success:
      "border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400",
    warning:
      "border-amber-500/50 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400",
    destructive:
      "border-red-500/50 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400",
    info: "border-blue-500/50 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400",
  },
  ghost: {
    success:
      "text-green-600 hover:bg-green-500/10 hover:text-green-700 dark:text-green-400",
    warning:
      "text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400",
    destructive:
      "text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400",
    info: "text-blue-600 hover:bg-blue-500/10 hover:text-blue-700 dark:text-blue-400",
  },
  solid: {
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    info: "bg-blue-600 text-white hover:bg-blue-700",
  },
};

function AppButtonImpl({
  children,
  loading = false,
  loadingText = "Đang xử lý...",
  icon,
  disabled,
  className,
  visual,
  variant,
  color,
  ...props
}: AppButtonProps) {
  const resolvedVariant =
    variant ?? (visual ? VISUAL_FORCED_VARIANT[visual] : undefined);
  const isIconSize = props.size?.includes("icon");
  const resolvedIcon = icon ?? (visual ? VISUAL_ICONS[visual] : undefined);

  const colorTone =
    resolvedVariant === "outline" || resolvedVariant === "ghost"
      ? resolvedVariant
      : "solid";

  return (
    <Button
      {...props}
      variant={resolvedVariant}
      disabled={loading || disabled}
      className={cn(
        HOVER_SHEEN,
        visual && VISUAL_CLASSES[visual],
        color && COLOR_CLASSES[colorTone][color],
        className,
      )}
    >
      {loading ? (
        <>
          <Spinner />
          {!isIconSize && loadingText}
        </>
      ) : (
        <>
          {resolvedIcon}
          {children}
        </>
      )}
    </Button>
  );
}

export const AppButton = memo(AppButtonImpl);

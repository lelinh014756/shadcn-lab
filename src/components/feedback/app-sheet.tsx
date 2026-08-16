"use client";

/**
 * AppSheet — port từ Payment-DIP-web, bọc `ui/sheet` thành một khung sẵn dùng:
 * header (có nút đổi vị trí trái/phải) + body cuộn được + footer.
 *
 * Khác bản gốc ở đúng hai chỗ, đều vì môi trường chứ không phải thiết kế:
 *   - Icon lấy từ `lucide-react` thay `@hugeicons` (xem `general/app-icon.tsx`).
 *   - Không persist `placement` — giống bản gốc, nó chỉ sống trong phiên mở.
 *
 * `onOpenAutoFocus` bị chặn: sheet mở ra không tự nhảy focus vào control đầu
 * tiên, tránh bàn phím ảo bật lên trên mobile và tránh nhảy trang khi body dài.
 */

import { PanelLeft, PanelRight } from "lucide-react";
import { memo, useState } from "react";

import { AppTooltip } from "@/components/data-display/app-tooltip";
import { AppButton } from "@/components/general/app-button";
import { AppIcon } from "@/components/general/app-icon";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AppSheetPlacement = "left" | "right";

// ─── Variant mapping ─────────────────────────────────────────────────────────

/**
 * Phải ghi kèm `data-[side=right]:` vì `ui/sheet` đã đặt sẵn
 * `data-[side=right]:sm:max-w-sm` — không thắng lại selector đó thì mọi variant
 * rộng hơn `sm` đều bị kéo về 24rem.
 */
const VARIANT_CLASSES = {
  contained: "sm:max-w-md data-[side=right]:sm:max-w-md",
  narrow: "sm:max-w-sm data-[side=right]:sm:max-w-sm",
  wide: "sm:max-w-2xl data-[side=right]:sm:max-w-2xl",
  full: "w-full data-[side=right]:w-full sm:max-w-none data-[side=right]:sm:max-w-none",
} as const;

/**
 * `contained` — mặc định, cột nội dung 28rem, dùng cho form/detail thông thường.
 * `narrow` — rail gọn cho filter/quick-view (24rem).
 * `wide` — rail rộng hơn cho form nhiều section (42rem).
 * `full` — chiếm toàn bộ chiều rộng, không giới hạn max-width.
 */
export type AppSheetVariant = keyof typeof VARIANT_CLASSES;

export interface AppSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Header
  title?: React.ReactNode;
  description?: React.ReactNode;

  // Body
  children?: React.ReactNode;
  bodyClassName?: string;

  // Footer — truyền `footer` để thay hẳn, không thì dùng mặc định Huỷ + Xác nhận
  footer?: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  isSubmitDisabled?: boolean;
  isSubmitting?: boolean;
  submittingText?: string;
  hideFooter?: boolean;

  // Đổi vị trí trái/phải
  defaultPlacement?: AppSheetPlacement;
  showPlacementToggle?: boolean;

  /** Kích thước sheet: `contained` (mặc định) | `narrow` | `wide` | `full`. */
  variant?: AppSheetVariant;

  className?: string;
}

function AppSheetImpl({
  open,
  onOpenChange,
  title,
  description,
  children,
  bodyClassName,
  footer,
  submitLabel = "Xác nhận",
  cancelLabel = "Hủy bỏ",
  onSubmit,
  onCancel,
  isSubmitDisabled = false,
  isSubmitting = false,
  submittingText = "Đang xử lý...",
  hideFooter = false,
  defaultPlacement = "right",
  showPlacementToggle = true,
  variant = "contained",
  className,
}: AppSheetProps) {
  const [placement, setPlacement] =
    useState<AppSheetPlacement>(defaultPlacement);

  const togglePlacement = () =>
    setPlacement((prev) => (prev === "right" ? "left" : "right"));

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const defaultFooter = (
    <>
      <AppButton variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
        {cancelLabel}
      </AppButton>
      <AppButton
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        loading={isSubmitting}
        loadingText={submittingText}
      >
        {submitLabel}
      </AppButton>
    </>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={placement}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn(
          "flex flex-col gap-0 p-0",
          VARIANT_CLASSES[variant],
          className,
        )}
      >
        <SheetHeader className="shrink-0 border-b bg-muted/40 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            {showPlacementToggle && (
              <div className="-ml-2 flex shrink-0 items-center gap-1">
                <AppTooltip
                  text={
                    placement === "right"
                      ? "Chuyển sang bên trái"
                      : "Chuyển sang bên phải"
                  }
                >
                  <button
                    type="button"
                    onClick={togglePlacement}
                    aria-label="Đổi vị trí"
                    className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  >
                    <AppIcon
                      icon={placement === "right" ? PanelLeft : PanelRight}
                      size={16}
                    />
                  </button>
                </AppTooltip>
                <Separator orientation="vertical" className="h-8" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {title && (
                <SheetTitle className="truncate font-semibold text-sm leading-tight">
                  {title}
                </SheetTitle>
              )}
              {description && (
                <SheetDescription className="mt-0.5 text-xs leading-snug">
                  {description}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className={cn("min-h-0 flex-1 overflow-y-auto", bodyClassName)}>
          {children}
        </div>

        {!hideFooter && (
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t bg-muted/40 px-3 py-2">
            {footer ?? defaultFooter}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

export const AppSheet = memo(AppSheetImpl);

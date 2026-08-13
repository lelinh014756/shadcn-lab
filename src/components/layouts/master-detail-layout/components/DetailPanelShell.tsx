"use client";

/**
 * DetailPanelShell
 * ----------------
 * Shell layout cho detail panel: header compact + tabs.
 *
 * Thay đổi so với phiên bản cũ:
 * - Bỏ subtitle text line. Badge xuống ngay sau title (inline, cùng 1 dòng).
 * - Badge nhỏ gọn riêng (PanelBadge) thay BadgeStatus — kích thước nhỏ hơn, bám sát header.
 * - Collapse button thay close button:
 *     - Click → resize detail panel chỉ còn header (dùng onToggle từ MasterDetailLayout).
 *     - Click lại → expand về size trước.
 *     - Icon đổi theo trạng thái (ChevronDown / ChevronUp).
 * - isCollapsed prop để ẩn tabs khi panel đang thu gọn.
 */

import { ChevronDown, ChevronUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DetailPanelTabs, type DetailTab } from "./DetailPanelTabs";

/* ------------------------------------------------------------------ */
/* PanelBadge — badge nhỏ gọn riêng cho header panel                  */
/* ------------------------------------------------------------------ */

type PanelBadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "closed"
  | "reprocess"
  | "cancelled";

const panelBadgeVariants: Record<PanelBadgeVariant, string> = {
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100   text-amber-700   border-amber-200   animate-pulse",
  error: "bg-rose-100    text-rose-700    border-rose-200",
  info: "bg-blue-100    text-blue-700    border-blue-200",
  neutral: "bg-slate-100   text-slate-700   border-slate-200",
  closed: "bg-slate-200   text-slate-800   border-slate-300",
  reprocess: "bg-indigo-100  text-indigo-700  border-indigo-200  animate-pulse",
  cancelled: "bg-rose-100    text-rose-700    border-rose-200",
};

export interface PanelBadgeProps {
  variant?: PanelBadgeVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

/**
 * PanelBadge — badge trong DetailPanelShell header.
 * Cùng chiều cao h-7 với PanelActions; text-xs (12px).
 * Module dùng component này thay vì BadgeStatus trong badge prop.
 */
export function PanelBadge({
  variant = "neutral",
  icon: Icon,
  children,
  className,
}: PanelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-sm border px-2.5",
        "text-xs font-medium leading-none whitespace-nowrap",
        panelBadgeVariants[variant],
        className,
      )}
    >
      {Icon && <Icon size={11} className="shrink-0" />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* DetailPanelShell props                                               */
/* ------------------------------------------------------------------ */

interface DetailPanelShellProps<T extends string> {
  // ===== Entity info =====
  icon?: LucideIcon;
  title: string;
  /** Badge nhỏ gọn — dùng <PanelBadge> thay <BadgeStatus>. */
  badge?: React.ReactNode;

  // ===== Actions =====
  actions?: React.ReactNode;

  // ===== Collapse (từ MasterDetailLayout) =====
  /** Trạng thái collapse hiện tại. */
  isCollapsed?: boolean;
  /** Toggle collapse/expand panel. */
  onToggle?: () => void;

  // ===== Tabs =====
  tabs: readonly DetailTab<T>[];
  defaultTab: T;
  renderContent: (tabId: T) => React.ReactNode;

  // ===== Layout =====
  emptyState?: React.ReactNode;
  isVisible?: boolean;
  isLoading?: boolean;
  className?: string;
}

function DefaultEmptyState() {
  return (
    <div className="flex h-full min-h-[80px] items-center justify-center text-xs text-muted-foreground">
      Chọn một mục để xem chi tiết
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DetailPanelShell                                                     */
/* ------------------------------------------------------------------ */

export function DetailPanelShell<T extends string>({
  icon: Icon,
  title,
  badge,
  actions,
  isCollapsed = false,
  onToggle,
  tabs,
  defaultTab,
  renderContent,
  emptyState,
  isVisible = true,
  isLoading,
  className,
}: DetailPanelShellProps<T>) {
  if (!isVisible && !isLoading) {
    return (
      <div className={cn("h-full", className)}>
        {emptyState ?? <DefaultEmptyState />}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex h-full flex-col overflow-hidden bg-card", className)}>
        <div className="flex shrink-0 items-center gap-2 border-b px-3 py-1.5">
          <div className="h-6 w-6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex-1 space-y-3 p-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-card",
        className,
      )}
    >
      {/* ===== Header — compact strip (shorter than AppCard cardHeader) ===== */}
      <div
        className={cn(`relative flex items-center justify-between gap-2 rounded-t-xl border-b border-[var(--shell-card-header-border)] bg-[var(--shell-card-header-background)] ${"min-h-11 pl-3 pr-4 py-2 md:pl-4 md:pr-5 md:py-2"}`, "min-h-8 py-1 md:py-1")}
      >
        <span aria-hidden className={"pointer-events-none absolute top-2 bottom-2 left-0 w-1 rounded-r-sm bg-[var(--shell-card-header-indicator)] shadow-[2px_0_0_color-mix(in_srgb,var(--shell-card-header-indicator)_35%,transparent),0_0_10px_color-mix(in_srgb,var(--shell-card-header-indicator)_50%,transparent)]"} />
        {Icon && (
          <div className="flex size-5 shrink-0 items-center justify-center rounded-md text-primary">
            <Icon className="size-4" aria-hidden />
          </div>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          <span className="min-w-0 truncate text-sm font-bold leading-5 text-primary">
            {title}
          </span>

          {badge}
        </div>

        {/* Business actions — compact */}
        {actions && (
          <div className="hidden shrink-0 items-center gap-0.5 lg:flex">
            {actions}
          </div>
        )}

        {/* Collapse / expand toggle */}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label={isCollapsed ? "Mở rộng panel" : "Thu gọn panel"}
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>

      {/* ===== Tabs — ẩn khi collapsed ===== */}
      {!isCollapsed && (
        <DetailPanelTabs
          tabs={tabs}
          defaultTab={defaultTab}
          renderContent={renderContent}
        />
      )}
    </div>
  );
}
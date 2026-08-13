"use client";

/**
 * StaffContextCard — hiển thị avatar + tên + meta (code · phòng · chức vụ)
 * ở header sheet, để user biết đang cấp tài khoản cho nhân viên nào.
 */

import { getInitials } from "./helpers";

interface StaffContextCardProps {
  fullName?: string | null;
  code?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  isLoading?: boolean;
}

export function StaffContextCard({
  fullName,
  code,
  departmentName,
  positionName,
  isLoading,
}: StaffContextCardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-56 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  const meta = [code, departmentName, positionName].filter(Boolean) as string[];

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {getInitials(fullName)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">
          {fullName ?? "—"}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {meta.map((item, idx) => (
            <span key={item} className="flex items-center gap-1.5">
              {idx === 0 ? (
                <span className="font-mono">{item}</span>
              ) : (
                <span>{item}</span>
              )}
              {idx < meta.length - 1 ? (
                <span
                  aria-hidden
                  className="size-1 rounded-full bg-muted-foreground/40"
                />
              ) : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type StaffStatusId, staffStatuses } from "@/mocks/employees";

const toneClasses: Record<string, string> = {
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  destructive:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

interface EmployeeStatusBadgeProps {
  statusId?: number | null;
  className?: string;
}

function EmployeeStatusBadgeImpl({
  statusId,
  className,
}: EmployeeStatusBadgeProps) {
  const status = staffStatuses.find(
    (item) => item.id === (statusId as StaffStatusId),
  );

  if (!status) {
    return (
      <Badge variant="outline" className={className}>
        —
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(toneClasses[status.tone], className)}
    >
      {status.label}
    </Badge>
  );
}

export const EmployeeStatusBadge = memo(EmployeeStatusBadgeImpl);

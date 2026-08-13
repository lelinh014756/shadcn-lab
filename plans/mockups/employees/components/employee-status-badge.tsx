"use client";

/**
 * EmployeeStatusBadge
 * ------------------
 * Wrapper component cho BadgeStatus, map staffStatusId (1, 2, 3)
 * sang BadgeStatus constants (EMPLOYEE_WORKING, EMPLOYEE_ON_LEAVE, EMPLOYEE_RESIGNED).
 *
 * Reuse in: employees-detail-panel.tsx, employees table (khi add status column)
 */

import { memo } from "react";
import { BadgeStatus, type StatusCode } from "@/components/badge";

export const STAFF_STATUS_MAP = {
  1: "EMPLOYEE_WORKING" as const satisfies StatusCode,
  2: "EMPLOYEE_ON_LEAVE" as const satisfies StatusCode,
  3: "EMPLOYEE_RESIGNED" as const satisfies StatusCode,
} as const;

export type StaffStatusId = keyof typeof STAFF_STATUS_MAP;

interface EmployeeStatusBadgeProps {
  statusId?: number | null;
  className?: string;
}

const EmployeeStatusBadge = ({
  statusId,
  className,
}: EmployeeStatusBadgeProps) => {

  if (statusId == null) {
    return <BadgeStatus status="neutral" className={className}>—</BadgeStatus>;
  }

  const statusCode = STAFF_STATUS_MAP[statusId as StaffStatusId];
  if (!statusCode) {
    return <BadgeStatus status="neutral" className={className}>—</BadgeStatus>;
  }

  return <BadgeStatus status={statusCode} className={className} />;
};

export default memo(EmployeeStatusBadge);

"use client";

/**
 * EmployeesDetailPanel
 * --------------------
 * Detail panel cho module Nhân viên — dùng MasterDetailLayout pattern.
 *
 * - `DetailPanelShell` cấp header + tabs (Chi tiết / Lịch sử thực hiện / Tài liệu / Lịch sử bán hàng)
 * - `PanelActions` gồm các nghiệp vụ: Cấp/Huỷ tài khoản, Sửa, Vô hiệu/Kích hoạt lại, More
 * - Tab content: InfoTab, TimelineTab, DocumentsTab, SalesHistoryTab
 *
 * Deactivate/Reactivate, Delete flow: gọi trực tiếp mutation tại panel —
 * confirm dialog inline qua `AlertDialogStatus` không cần screen-level state.
 * ChangeActivateStaff flow: dispatch `openModal("CHANGE_STATUS", id)` —
 * `ChangeStaffStatusDialog` được render ở `employees-list-screen.tsx`.
 */

import { BriefcaseBusiness, UserRound } from "lucide-react";
import { useCallback } from "react";


import { useEmployeesContext } from "../context/employees-store";
import type { Employee } from "../types/employee";
import { DETAIL_TABS, type EmployeeDetailTabId } from "../constants/employee-detail";
import {
  DetailPanelShell,
} from "@/layouts/master-detail-layout/components/DetailPanelShell";
import {
  PanelActions,
  type PanelActionConfig,
} from "@/layouts/master-detail-layout/components/PanelActions";
import type { DetailPanelControls } from "@/layouts/master-detail-layout/master-detail-layout";

// Tab components
import { InfoTab } from "./info-tab";
import { TimelineTab } from "./timeline-tab";
import { DocumentsTab } from "./documents-tab";
import { SalesHistoryTab } from "./sales-history-tab";

import { useT } from "@/lib/i18n/context";
import EmployeeStatusBadge from "./employee-status-badge";
import { useChangeAccountStatus, useDeleteStaff } from "../hooks/use-employees-query";
import { notifyAdminError, notifyAdminSuccess, resolveErrorMessage } from "@/modules/system/shared/admin-toast-notify";

interface EmployeesDetailPanelProps extends DetailPanelControls {
  employee: Employee | null;
  className?: string;
}

// ─── Panel actions ─────────────────────────────────────────────────────────────

const LABEL_RESPONSIVE = "hidden @[600px]:inline";

function getEmployeeActions(
  employee: Employee,
  handlers: {
    onEdit: (emp: Employee) => void;
    onLockAccount: (id: number, isCurrentlyLocked: boolean) => void;
    onChangeStatus: (id: number) => void;
    onLinkUser: (id: number) => void;
    onDelete: (id: number) => void;
  },
): PanelActionConfig {
  const isActive = employee.isActive;

  return [
    {
      preset: "ADD",
      label: "Cấp tài khoản",
      variant: "info",
      labelClassName: LABEL_RESPONSIVE,
      visible: !employee.userId,
      disabled: !isActive,
      onClick: () => handlers.onLinkUser(employee.id),
    },

    {
      preset: "EDIT",
      label: "Sửa",
      labelClassName: LABEL_RESPONSIVE,
      onClick: () => handlers.onEdit(employee),
    },

    {
      label: "Tình trạng",
      variant: "info",
      icon: BriefcaseBusiness,
      labelClassName: LABEL_RESPONSIVE,
      onClick: () => handlers.onChangeStatus(employee.id),
    },

    {
      preset: isActive ? "DEACTIVATE" : "REACTIVATE",
      label: isActive ? "Vô hiệu hoá" : "Kích hoạt lại",
      labelClassName: LABEL_RESPONSIVE,
      onClick: () => handlers.onLockAccount(employee.id, !isActive),
    },

    {
      preset: "DELETE",
      label: "Xóa",
      labelClassName: LABEL_RESPONSIVE,
      onClick: () => handlers.onDelete(employee.id),
    },
  ];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function EmployeesDetailPanel({
  employee,
  onToggle,
  isCollapsed,
  className,
}: EmployeesDetailPanelProps) {
  const { dict } = useT();
  const d = dict.system.employees;

  const openModal = useEmployeesContext((s) => s.openModal);
  const openEditModal = useEmployeesContext((s) => s.openEditModal);

  const changeAccountStatus = useChangeAccountStatus({
    onSuccess: (_, vars) => {
      const nextKey = vars.payload.isLocked ? "toastDeactivateSuccess" : "toastReactivateSuccess";
      notifyAdminSuccess(dict, d[nextKey]);
    },
    onError: (err, vars) => {
      const nextKey = vars.payload.isLocked ? "toastDeactivateError" : "toastReactivateError";
      notifyAdminError(dict, resolveErrorMessage(err, d[nextKey]));
    },
  });

  const deleteStaff = useDeleteStaff({
    onSuccess: () => notifyAdminSuccess(dict, d.toastDeleteSuccess),
    onError: (err) => notifyAdminError(dict, resolveErrorMessage(err, d.toastDeleteError)),
  });

  const handleEdit = useCallback(
    (emp: Employee) => {
      openEditModal(emp);
    },
    [openEditModal],
  );

  // Khoá tài khoản (mở khoá tương ứng): mutation trực tiếp tại panel.
  // Dùng employee.isActive để biết đang khoá hay mở khoá.
  const handleLockAccount = useCallback(
    (id: number, _isCurrentlyLocked: boolean) => {
      const isLocked = employee?.isActive ?? false;
      changeAccountStatus.mutate({ id, payload: { isLocked } });
    },
    [changeAccountStatus, employee?.isActive],
  );

  const handleChangeStatus = useCallback(
    (id: number) => {
      openModal("CHANGE_STATUS", id);
    },
    [openModal],
  );

  const handleDelete = useCallback(
    (id: number) => {
      deleteStaff.mutate(id);
    },
    [deleteStaff],
  );

  const handleLinkUser = useCallback(
    (id: number) => {
      openModal("LINK_USER", id);
    },
    [openModal],
  );

  const actions = employee
    ? getEmployeeActions(employee, {
      onEdit: handleEdit,
      onLockAccount: handleLockAccount,
      onChangeStatus: handleChangeStatus,
      onLinkUser: handleLinkUser,
      onDelete: handleDelete,
    })
    : [];

  return (
    <DetailPanelShell<EmployeeDetailTabId>
      icon={UserRound}
      title={employee?.fullName ?? "—"}
      badge={employee ? <EmployeeStatusBadge statusId={employee.staffStatusId} /> : undefined}
      actions={employee ? (
        <PanelActions
          items={actions}
          name="Nhân viên"
          entityData={{ id: employee.id, name: employee.fullName }}
          isLoading={changeAccountStatus.isPending || deleteStaff.isPending}
          maxVisible={6}
        />
      ) : undefined}
      onToggle={onToggle}
      isCollapsed={isCollapsed}
      isVisible={!!employee}
      emptyState={
        <div className="flex h-full min-h-[80px] items-center justify-center text-xs text-muted-foreground">
          Chọn một nhân viên để xem chi tiết
        </div>
      }
      tabs={DETAIL_TABS}
      defaultTab="timeline"
      renderContent={(id) => {
        if (!employee) return null;
        switch (id) {
          case "info":
            return <InfoTab employee={employee} />;
          case "timeline":
            return <TimelineTab employee={employee} />;
          case "documents":
            return <DocumentsTab employee={employee} />;
          case "sales":
            return <SalesHistoryTab employee={employee} />;
        }
      }}
      className={className}
    />
  );
}
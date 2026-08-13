"use client";

import { Pencil, UserCheck, UserX } from "lucide-react";
import {
  AdminSheet,
  AdminSheetContent,
  AdminSheetFooter,
  AdminSheetHeader,
  AdminSheetHeaderMeta,
  AdminSheetTitle,
} from "@/components/overlay/admin-sheet";
import { SheetSectionCard } from "@/components/overlay/sheet-section-card";
import { ButtonApp } from "@/components/button/button-app";
import { StatusBadge } from "@/components/data-display/status-badge";
import { useT } from "@/lib/i18n/context";
import { formatDateDisplay, formatDateTimeDisplay } from "@/lib/utils/format-datetime";
import { useEmployeesContext } from "../context/employees-store";
import { useEmployeeDetail } from "../hooks/use-employees-query";
import { useUnlinkUser, useChangeAccountStatus } from "../hooks/use-employees-query";
import { ProjectStaffByStaffSection } from "@/modules/projects/components/project/staff-by-staff-section";
import { notifyAdminError, notifyAdminSuccess, resolveErrorMessage } from "@/modules/system/shared/admin-toast-notify";

type Props = {
  open: boolean;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value ?? "—"}</span>
    </div>
  );
}

export default function EmployeeDetailSheet({ open }: Props) {
  const { dict } = useT();
  const d = dict.system.employees;
  const sc = dict.system.common;

  const detailEmployeeId = useEmployeesContext((s) => s.detailEmployeeId);
  const closeModal = useEmployeesContext((s) => s.closeModal);
  const openEditModal = useEmployeesContext((s) => s.openEditModal);

  const { data: employee, isLoading } = useEmployeeDetail(detailEmployeeId);

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
  const unlink = useUnlinkUser({
    onSuccess: () => closeModal("DETAIL"),
  });

  if (!employee) return null;

  const isActive = employee.isActive;
  const isLoadingAny = isLoading || changeAccountStatus.isPending || unlink.isPending;

  return (
    <AdminSheet open={open} onOpenChange={(v) => { if (!v) closeModal("DETAIL"); }}>
      <AdminSheetContent side="right" variant="full" className="flex flex-col">
        <AdminSheetHeader>
          <AdminSheetHeaderMeta>
            <AdminSheetTitle>{d.code} {employee.code}</AdminSheetTitle>
          </AdminSheetHeaderMeta>
        </AdminSheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 px-1 py-4">
          {/* Thông tin cơ bản */}
          <SheetSectionCard title={d.sectionBasic} tone="info">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <DetailRow label={d.code} value={employee.code} />
              <DetailRow label={d.fullName} value={employee.fullName} />
              <DetailRow label={d.gender ?? "Giới tính"} value={employee.gender} />
              <DetailRow label={d.dateOfBirth ?? "Ngày sinh"} value={formatDateDisplay(employee.dateOfBirth)} />
              <DetailRow label={d.personalEmail ?? "Email cá nhân"} value={employee.personalEmail} />
              <DetailRow label={d.personalPhone ?? "Điện thoại cá nhân"} value={employee.personalPhone} />
              <div className="col-span-2">
                <DetailRow label={d.address ?? "Địa chỉ"} value={employee.address} />
              </div>
            </div>
          </SheetSectionCard>

          {/* Thông tin công việc */}
          <SheetSectionCard title={d.sectionWork ?? "Công việc"} tone="info">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <DetailRow label={d.positionPlaceholder ?? "Chức vụ"} value={employee.positionName} />
              <DetailRow label={d.jobTitle ?? "Công việc"} value={employee.jobTitle} />
              <DetailRow label={d.email} value={employee.workEmail} />
              <DetailRow label={d.workPhone ?? "Điện thoại công ty"} value={employee.workPhone} />
              <DetailRow label={d.startDate ?? "Ngày vào"} value={formatDateDisplay(employee.startDate)} />
              <DetailRow label={d.endDate ?? "Ngày nghỉ"} value={formatDateDisplay(employee.endDate)} />
            </div>
          </SheetSectionCard>

          {/* Thông tin tổ chức */}
          <SheetSectionCard title={d.sectionOrganization ?? "Tổ chức"} tone="info">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <DetailRow label={d.organizationId} value={employee.organizationName} />
              <DetailRow label={d.departmentName} value={employee.departmentName} />
              <DetailRow label={d.managerPlaceholder ?? "Quản lý"} value={employee.managerName} />
              <DetailRow
                label={sc.status}
                value={<StatusBadge status={isActive ? "active" : "inactive"} label={isActive ? sc.active : sc.inactive} />}
              />
            </div>
          </SheetSectionCard>

          {/* Tài khoản liên kết */}
          <SheetSectionCard title={d.userId} tone="info">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <DetailRow label="Username" value={employee.userName} />
              <DetailRow label="Has Linked User" value={employee.hasLinkedUser ? "Yes" : "No"} />
              <DetailRow label="User ID" value={employee.userId} />
            </div>
          </SheetSectionCard>

          {/* Dự án tham gia */}
          <SheetSectionCard title={d.sectionProjects} tone="info">
            <ProjectStaffByStaffSection staffId={employee.id} />
          </SheetSectionCard>

          {/* Hệ thống */}
          <SheetSectionCard title="Hệ thống" tone="info">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <DetailRow label="Tạo lúc" value={formatDateTimeDisplay(employee.createdAt)} />
              <DetailRow label="Tạo bởi" value={employee.createdByName} />
              <DetailRow label="Cập nhật lúc" value={formatDateTimeDisplay(employee.updatedAt)} />
              <DetailRow label="Cập nhật bởi" value={employee.updatedByName} />
              {employee.deactivateEffectiveDate && (
                <DetailRow
                  label={d.deactivateEffectiveDate ?? "Ngày vô hiệu"}
                  value={formatDateDisplay(employee.deactivateEffectiveDate)}
                />
              )}
            </div>
          </SheetSectionCard>
        </div>

        <AdminSheetFooter className="flex justify-end gap-3 border-t pt-4">
          {isActive ? (
            <ButtonApp
              variant="ghost"
              intent="destructive"
              onClick={() => {
                changeAccountStatus.mutate({ id: employee.id, payload: { isLocked: true } });
              }}
              loading={isLoadingAny}
            >
              <UserX aria-hidden />
              {d.actionDeactivateTooltip}
            </ButtonApp>
          ) : (
            <ButtonApp
              variant="ghost"
              intent="info"
              onClick={() => {
                void changeAccountStatus.mutate(
                  { id: employee.id, payload: { isLocked: false } },
                  { onSuccess: () => closeModal("DETAIL") },
                );
              }}
              loading={isLoadingAny}
            >
              <UserCheck aria-hidden />
              {d.actionReactivateTooltip}
            </ButtonApp>
          )}
          {employee.hasLinkedUser && (
            <ButtonApp
              variant="ghost"
              intent="destructive"
              onClick={() => { void unlink.mutate(employee.id); }}
              loading={isLoadingAny}
            >
              <UserX aria-hidden />
              {d.unlinkUser ?? "Hủy liên kết"}
            </ButtonApp>
          )}
          <ButtonApp
            variant="secondary"
            preset="edit"
            onClick={() => {
              closeModal("DETAIL");
              openEditModal(employee);
            }}
          >
            <Pencil aria-hidden />
            {d.actionEditTooltip}
          </ButtonApp>
        </AdminSheetFooter>
      </AdminSheetContent>
    </AdminSheet>
  );
}
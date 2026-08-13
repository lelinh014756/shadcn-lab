"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Employee } from "@/mocks/employees";

import { EmployeeStatusBadge } from "./employee-status-badge";

interface EmployeesDetailPanelProps {
  employee: Employee | null;
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function EmployeesDetailPanel({
  employee,
  isCollapsed,
  onToggle,
  className,
}: EmployeesDetailPanelProps) {
  return (
    <aside className={cn("flex h-full flex-col border-l bg-card", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <p className="truncate font-medium text-sm">
          {isCollapsed ? "" : (employee?.fullName ?? "Chi tiết nhân viên")}
        </p>
      
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 text-sm">
          {!employee ? (
            <p className="text-muted-foreground text-xs">
              Chọn một dòng để xem chi tiết.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{employee.code}</Badge>
                <EmployeeStatusBadge statusId={employee.staffStatusId} />
                {employee.hasLinkedUser && (
                  <Badge variant="secondary">@{employee.userName}</Badge>
                )}
              </div>

              <Section title="Thông tin công việc">
                <Field label="Chức vụ" value={employee.positionName} />
                <Field label="Chức danh" value={employee.jobTitle} />
                <Field label="Phòng ban" value={employee.departmentName} />
                <Field label="Đơn vị" value={employee.organizationName} />
                <Field label="Quản lý" value={employee.managerName} />
                <Field
                  label="Ngày vào"
                  value={formatDate(employee.startDate ?? "")}
                />
                {employee.endDate && (
                  <Field
                    label="Ngày nghỉ"
                    value={formatDate(employee.endDate)}
                  />
                )}
              </Section>

              <Separator />

              <Section title="Liên hệ">
                <Field label="Email công ty" value={employee.workEmail} />
                <Field label="Email cá nhân" value={employee.personalEmail} />
                <Field label="ĐT công ty" value={employee.workPhone} />
                <Field label="ĐT cá nhân" value={employee.personalPhone} />
                <Field label="Địa chỉ" value={employee.address} />
              </Section>

              <Separator />

              <Section title="Cá nhân & định danh">
                <Field label="Giới tính" value={employee.gender} />
                <Field
                  label="Ngày sinh"
                  value={formatDate(employee.dateOfBirth ?? "")}
                />
                <Field label="Loại giấy tờ" value={employee.idtype} />
                <Field label="Số giấy tờ" value={employee.idnumber} />
                <Field label="Nơi cấp" value={employee.idissuedPlace} />
              </Section>

              <Separator />

              <Section title="Ngân hàng & thuế">
                <Field label="Chủ tài khoản" value={employee.bankAccountName} />
                <Field label="Số tài khoản" value={employee.bankAccount} />
                <Field label="Ngân hàng" value={employee.bankCode} />
                <Field label="Mã số thuế" value={employee.taxNumber} />
              </Section>

              {employee.notes && (
                <>
                  <Separator />
                  <Section title="Ghi chú">
                    <p className="text-muted-foreground text-xs">
                      {employee.notes}
                    </p>
                  </Section>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-words">{value || "—"}</span>
    </div>
  );
}

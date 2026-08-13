"use client";

/**
 * InfoTab
 * --------
 * Nội dung tab "Chi tiết" của EmployeeDetailPanel.
 * Layout: SectionSplit — main (Personal + Work), aside (Account + SystemMeta).
 */

import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Link2,
  Mail,
  Phone,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import { Descriptions } from "@/components/data-display/descriptions";

import { Badge } from "@/components/ui-elements/badge";
import { StatusBadge } from "@/components/data-display/status-badge";
import { ButtonApp } from "@/components/button/button-app";
import {
  formatDateDisplay,
  formatDateTimeDisplay,
} from "@/lib/utils/format-datetime";

import type { Employee } from "../types/employee";
import { Section, SectionSplit, SectionStack } from "@/components/layout";

// ─── Shared bits ───────────────────────────────────────────────────────────────

function InlineIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon aria-hidden className="size-3 shrink-0 text-muted-foreground" />;
}

function getInitials(name?: string | null): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Tab: Chi tiết ────────────────────────────────────────────────────────────

export function InfoTab({ employee }: { employee: Employee }) {
  return (
    <div className="h-full overflow-y-auto ">
      <div className="p-4">
        <SectionSplit
          asideWidth="340px"
          main={
            <SectionStack>
              <PersonalInfoSection employee={employee} />
              <WorkInfoSection employee={employee} />
            </SectionStack>
          }
          aside={
            <SectionStack>
              <AccountSection employee={employee} />
              <SystemMetaSection employee={employee} />
            </SectionStack>
          }
        />
      </div>
    </div>
  );
}

// ─── Personal info section ───────────────────────────────────────────────────

function PersonalInfoSection({ employee }: { employee: Employee }) {
  return (
    <Section
      tone="info"
      title="Thông tin cá nhân"
    >
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Họ và tên">
          <span className="font-medium">{employee.fullName || "—"}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Giới tính">{employee.gender}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          <span className="tabular-nums">
            {formatDateDisplay(employee.dateOfBirth)}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Email cá nhân">
          {employee.personalEmail ? (
            <span className="inline-flex items-center gap-1.5">
              <InlineIcon icon={Mail} />
              {employee.personalEmail}
            </span>
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="SĐT cá nhân">
          {employee.personalPhone ? (
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <InlineIcon icon={Phone} />
              {employee.personalPhone}
            </span>
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái nhân sự">
          <StatusBadge
            status={employee.isActive ? "active" : "inactive"}
            label={employee.isActive ? "Đang làm" : "Đã nghỉ"}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Địa chỉ" span="full">
          {employee.address}
        </Descriptions.Item>
      </Descriptions>
    </Section>
  );
}

// ─── Work info section ───────────────────────────────────────────────────────

function WorkInfoSection({ employee }: { employee: Employee }) {
  return (
    <Section
      tone="primary"
      title="Thông tin công việc"
    >
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Tổ chức">
          {employee.organizationName ? (
            <span className="inline-flex items-center gap-1.5">
              {employee.organizationName}
            </span>
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="Phòng ban">
          {employee.departmentName}
        </Descriptions.Item>
        <Descriptions.Item label="Quản lý trực tiếp">
          {employee.managerName ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="grid size-4 place-items-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
                {getInitials(employee.managerName)}
              </span>
              {employee.managerName}
            </span>
          ) : null}
        </Descriptions.Item>

        <Descriptions.Item label="Chức vụ">
          {employee.positionName ? (
            <Badge variant="outline" tone="primary" className="h-5 px-1.5 text-[10px]">
              {employee.positionName}
            </Badge>
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="Chức danh">{employee.jobTitle}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái làm việc">
          <StatusBadge
            status={employee.isActive ? "active" : "inactive"}
            label={employee.isActive ? "Đang làm" : "Đã nghỉ"}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Email công ty">
          {employee.workEmail ? (
            <span className="inline-flex items-center gap-1.5">
              <InlineIcon icon={Mail} />
              {employee.workEmail}
            </span>
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="SĐT công ty">
          {employee.workPhone ? (
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <InlineIcon icon={Phone} />
              {employee.workPhone}
            </span>
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày vào làm">
          <span className="tabular-nums">
            {formatDateDisplay(employee.startDate)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày nghỉ việc">
          <span className="tabular-nums">
            {formatDateDisplay(employee.endDate)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày vô hiệu">
          <span className="tabular-nums">
            {formatDateDisplay(employee.deactivateEffectiveDate)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">
          {employee.notes ? (
            employee.notes
          ) : (
            <span className="italic text-muted-foreground">Chưa có ghi chú</span>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Section>
  );
}

// ─── Account section (aside) ─────────────────────────────────────────────────

function AccountSection({ employee }: { employee: Employee }) {
  const linked = employee.hasLinkedUser;

  return (
    <Section tone="success" title="Tài khoản đăng nhập">
      <div className="space-y-3">
        {linked ? <LinkedUserCard employee={employee} /> : <EmptyAccountCard />}

        {linked ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Đăng nhập gần nhất">
              <span className="tabular-nums">—</span>
            </Descriptions.Item>
            <Descriptions.Item label="2FA">
              <span className="inline-flex items-center gap-1 text-[var(--color-success-text)]">
                <ShieldCheck aria-hidden className="size-3" />
                Chưa rõ
              </span>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <ButtonApp preset="save" className="h-8 w-full text-xs">
            <Link2 aria-hidden />
            Cấp tài khoản cho nhân viên
          </ButtonApp>
        )}
      </div>
    </Section>
  );
}

function LinkedUserCard({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-[var(--color-success-border)] bg-[var(--color-success-soft)]/50 p-2.5">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--color-success-default)] text-xs font-semibold text-white">
        {getInitials(employee.fullName)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">
          {employee.userName}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">
          {employee.workEmail ?? employee.personalEmail ?? "—"}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" tone="primary" className="h-4 px-1 text-[10px]">
            User ID: {employee.userId ?? "—"}
          </Badge>
          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-success-text)]">
            <span className="size-1.5 rounded-full bg-[var(--color-success-default)]" />
            Active
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyAccountCard() {
  return (
    <div className="rounded-md border border-dashed border-[var(--color-warning-border)] bg-[var(--color-warning-soft)]/50 p-3 text-center">
      <UserCog aria-hidden className="mx-auto size-6 text-[var(--color-warning-default)]" />
      <p className="mt-1.5 text-xs font-medium text-foreground">
        Chưa có tài khoản đăng nhập
      </p>
      <p className="text-[11px] text-muted-foreground">
        Cấp tài khoản để nhân viên có thể sử dụng hệ thống.
      </p>
    </div>
  );
}

// ─── System / metadata section ───────────────────────────────────────────────

function SystemMetaSection({ employee }: { employee: Employee }) {
  return (
    <Section tone="neutral" title="Hệ thống">
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Tạo bởi">
          {employee.createdByName ?? "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Tạo lúc">
          <span className="tabular-nums">
            {formatDateTimeDisplay(employee.createdAt)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật bởi">
          {employee.updatedByName ?? "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật lúc">
          <span className="tabular-nums">
            {formatDateTimeDisplay(employee.updatedAt)}
          </span>
        </Descriptions.Item>
      </Descriptions>
    </Section>
  );
}

// ─── Placeholder tabs ────────────────────────────────────────────────────────

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="grid h-full place-items-center bg-muted/30 p-8 text-center text-xs text-muted-foreground">
      <div>
        <p>Chưa triển khai: {label}</p>
        <p className="mt-1 text-[10.5px] text-muted-foreground/70">
          Sẽ được bổ sung ở phase tiếp theo.
        </p>
      </div>
    </div>
  );
}

export function ProjectsTab() {
  return <EmptyTab label="Dự án tham gia" />;
}

export function TimelineTab() {
  return <EmptyTab label="Timeline hoạt động" />;
}

export function DocumentsTab() {
  return <EmptyTab label="Tài liệu / Hợp đồng lao động" />;
}

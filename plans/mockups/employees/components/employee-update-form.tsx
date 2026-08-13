"use client";

/**
 * EmployeeUpdateForm
 * ------------------
 * Orchestrator cho form CREATE / EDIT nhân viên. Chỉ quản lý:
 *   - `useForm` + zod resolver
 *   - Submit handler (create vs update) + toast
 *   - Layout composition (SectionStack + SectionSplit)
 *
 * Nội dung mỗi section được tách vào `./employee-update-form/`:
 *   - `PersonalInfoSection`     — Row 1 (info tone, 4-col, 7 fields)
 *   - `OrganizationSection`     — Row 2 main (violet, narrow, 3 fields)
 *   - `WorkInfoSection`         — Row 2 aside (violet, 7 fields)
 *   - `ContactAddressSection`   — Row 3 main (neutral, narrow, 4 fields)
 *   - `PermanentAddressSection` — Row 3 aside (5 fields + notes)
 *   - `IdentityBankSection`     — Row 4 (success, 4-col, 8 fields)
 *
 * Total ~30+ fields → không viable inline; tách theo section giúp maintain
 * dễ hơn (mỗi file ≤180 LOC).
 */

import React, { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";

import { useT } from "@/lib/i18n/context";
import { DATE_REQUEST_FORMAT } from "@/shared/constants/format";
import { SectionSplit, SectionStack } from "@/components/layout";
import {
  notifyAdminErrorFromException,
  notifyAdminSuccess,
} from "@/modules/system/shared/admin-toast-notify";

import { useEmployeesContext } from "../context/employees-store";
import {
  useCreateEmployee,
  useUpdateEmployee,
} from "../hooks/use-employees-query";
import {
  EmployeeFormSchema,
  employeeFormSchema,
} from "../schemas/employee-form-schema";
import type { Employee } from "../types/employee";

import {
  buildDefaultValues,
  ContactAddressSection,
  IdentityBankSection,
  OrganizationSection,
  PermanentAddressSection,
  PersonalInfoSection,
  WorkInfoSection,
} from "./employee-update-form/index";

// ─── Public constants ────────────────────────────────────────────────────────

export const FORM_ID = "employee_update_form";

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  editingEmployee?: Employee | null;
  /** Render footer buttons — nhận `isDirty` để enable/disable save. */
  children: (isDirty: boolean) => React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

const EmployeeUpdateForm = ({ editingEmployee, children }: Props) => {
  const { dict } = useT();
  const d = dict.system.employees;

  const modals = useEmployeesContext((s) => s.modals);
  const closeModal = useEmployeesContext((s) => s.closeModal);
  const isEdit = !!modals.EDIT;

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const form = useForm<EmployeeFormSchema>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(employeeFormSchema) as any,
    defaultValues: buildDefaultValues(editingEmployee),
  });

  const { isDirty } = form.formState;

  async function onSubmit(data: EmployeeFormSchema) {
    if (isEdit && editingEmployee) {
      // EDIT: staffStatusId bị ẩn khỏi UI (đổi qua CHANGE_STATUS dialog) —
      // preserve giá trị gốc để không gửi undefined lên BE.
      const payload: EmployeeFormSchema = {
        ...data,
        startDate: dayjs(data.startDate).format(DATE_REQUEST_FORMAT),
        dateOfBirth: dayjs(data.dateOfBirth).format(DATE_REQUEST_FORMAT),
        ...(data.staffStatusId === undefined &&
        editingEmployee.staffStatusId !== undefined
          ? { staffStatusId: editingEmployee.staffStatusId }
          : {}),
      };

      updateMutation.mutate(
        { id: editingEmployee.id, payload },
        {
          onSuccess: () => {
            notifyAdminSuccess(dict, d.toastUpdateSuccess);
            closeModal("EDIT");
          },
          onError: (err) => {
            notifyAdminErrorFromException(dict, err, d.toastUpdateError);
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          notifyAdminSuccess(dict, d.toastCreateSuccess);
          closeModal("CREATE");
        },
        onError: (err) => {
          notifyAdminErrorFromException(dict, err, d.toastCreateError);
        },
      });
    }
  }

  return (
    <>
      <form
        id={FORM_ID}
        className="overflow-y-auto p-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <SectionStack>
          {/* Row 1: Thông tin cá nhân (full-width) */}
          <PersonalInfoSection control={form.control} isEdit={isEdit} />

          {/* Row 2: Tổ chức (narrow left) + Công việc (giãn phải) */}
          <SectionSplit
            mainWidth="340px"
            main={
              <OrganizationSection
                control={form.control}
                excludeManagerId={editingEmployee?.id}
              />
            }
            aside={<WorkInfoSection control={form.control} isEdit={isEdit} />}
          />

          {/* Row 3: Địa chỉ liên hệ (narrow left) + Thường trú/Ghi chú (phải) */}
          <SectionSplit
            mainWidth="340px"
            main={<ContactAddressSection form={form} />}
            aside={<PermanentAddressSection form={form} />}
          />

          {/* Row 4: Định danh + Thuế/Ngân hàng (full-width) */}
          <IdentityBankSection control={form.control} />
        </SectionStack>
      </form>
      {children(isDirty)}
    </>
  );
};

export default memo(EmployeeUpdateForm);

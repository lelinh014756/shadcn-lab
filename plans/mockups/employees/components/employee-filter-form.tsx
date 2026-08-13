"use client";

/**
 * EmployeeFilterForm — filter sheet form with React Hook Form.
 * All fields are optional (nullable). Renders inside AdminFilterSheet.
 *
 * Usage:
 *   <EmployeeFilterForm
 *     defaultValues={appliedFilters}
 *   />
 *
 * Notes:
 *   - formId comes from AdminFiltersContext (not a prop)
 *   - Form's onSubmit calls context.onApply + context.setOpen(false)
 *   - Form resets to defaultValues when sheet opens
 *   - Specialized selects aligned with employee-update-form.tsx pattern
 *   - positionId uses ComboBoxApp with numeric id (from positions lookup)
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useT } from "@/lib/i18n/context";
import { useAdminFiltersContext } from "@/components/layout/admin-filters";
import { EmployeeFilterSchema, employeeFilterSchema } from "../schemas/employee-form-schema";
import { OrganizationInternalFormSelect } from "../../organizations/components/organization-internal-select";
import { EmployeeStatusFormSelect } from "@/components/app/employee-status-select";
import { DepartmentsFormSelect } from "@/components/app/departments-select";
import { EmployeeFormSelect } from "./employee-select";
import { UserTitleFormSelect } from "@/components/app";
import { SelectActiveFormSelect } from "@/components/forms/select-active";
import { useEffect } from "react";

export const EMPLOYEE_FILTER_FORM_ID = "employee_filter_form";

interface Props {
  defaultValues?: Partial<EmployeeFilterSchema>;
}

const EmployeeFilterForm = ({
  defaultValues = {},
}: Props) => {
  const { dict } = useT();
  const d = dict.system.employees;
  const { formId, setOpen, onApply, registerResetHandler } = useAdminFiltersContext();

  const form = useForm<EmployeeFilterSchema>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(employeeFilterSchema) as any,
    defaultValues: {
      organizationId: defaultValues.organizationId,
      staffStatusId: defaultValues.staffStatusId,
      positionId: defaultValues.positionId,
      managerId: defaultValues.managerId,
      departmentId: defaultValues.departmentId,
      isActive: defaultValues.isActive
    },
  });

  // Reset form to defaultValues when sheet opens
  const { control, handleSubmit } = form;

  const onSubmit = (values: EmployeeFilterSchema) => {
    onApply(values as Record<string, unknown>);

    setOpen(false);
  };

  useEffect(() => {
    registerResetHandler(() => {
      onApply({
        organizationId: undefined,
        staffStatusId: undefined,
        positionId: undefined,
        managerId: undefined,
        departmentId: undefined,
        isActive: undefined
      })
    });
    return () => registerResetHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <OrganizationInternalFormSelect
          name="organizationId"
          control={control as never}
          label={d.organizationId}
        />

        <EmployeeStatusFormSelect
          name="staffStatusId"
          control={control as never}
          label={d.status}
        />

        <UserTitleFormSelect
          name="positionId"
          control={control as never}
          label={d.positionId}
          placeholder={d.positionPlaceholder}

        />

        <DepartmentsFormSelect
          name="departmentId"
          control={control as never}
          label={d.departmentId}
        />

        <EmployeeFormSelect
          name="managerId"
          control={control as never}
          label={d.managerId}
          placeholder={d.managerPlaceholder}
        />

        <SelectActiveFormSelect
          name="isActive"
          control={control as never}
        />
      </div>
    </form>
  );
};

export default EmployeeFilterForm;

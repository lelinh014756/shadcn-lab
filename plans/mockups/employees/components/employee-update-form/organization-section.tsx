"use client";

/**
 * Section 2 (main narrow 340px): Tổ chức — 3 fields, layout 1-col.
 *   Đơn vị · Phòng ban · Quản lý trực tiếp
 *
 * `excludeManagerId` — loại bỏ chính employee đang edit khỏi danh sách quản lý
 * (không thể là quản lý của chính mình).
 */

import { Controller, type Control } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui-elements/field";
import { Section, SectionGrid } from "@/components/layout";
import { DepartmentsSelect } from "@/components/app/departments-select";
import { OrganizationInternalSelect } from "../../../organizations/components/organization-internal-select";
import { useT } from "@/lib/i18n/context";
import type { EmployeeFormSchema } from "../../schemas/employee-form-schema";
import { EmployeeSelect } from "../employee-select";

interface Props {
  control: Control<EmployeeFormSchema>;
  excludeManagerId?: number;
}

export function OrganizationSection({ control, excludeManagerId }: Props) {
  const { dict } = useT();
  const d = dict.system.employees;

  return (
    <Section tone="violet" title={d.sectionOrganization} meta="3 trường">
      <SectionGrid cols={1}>
        <Controller
          name="organizationId"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{d.organizationId}</FieldLabel>
              <OrganizationInternalSelect
                {...field}
                placeholder={d.selectOrganizationPlaceholder}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="departmentId"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{d.departmentId}</FieldLabel>
              <DepartmentsSelect
                {...field}
                placeholder={d.selectDepartmentPlaceholder}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="managerId"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{d.managerId}</FieldLabel>
              <EmployeeSelect
                {...field}
                placeholder={d.managerPlaceholder}
                excludeIds={
                  excludeManagerId != null ? [excludeManagerId] : undefined
                }
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </SectionGrid>
    </Section>
  );
}

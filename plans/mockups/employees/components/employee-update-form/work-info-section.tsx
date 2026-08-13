"use client";

/**
 * Section 2 (aside): Công việc — 7 fields (chức vụ, chức danh, SĐT/email công
 * ty, ngày bắt đầu/kết thúc, trạng thái).
 *
 * Layout khác nhau CREATE vs EDIT:
 *   - CREATE: date range 50/50 + trạng thái nhân sự (staffStatusId)
 *   - EDIT: chỉ date range 50/50, staffStatusId ẩn (đổi qua CHANGE_STATUS dialog)
 */

import { Mail, Phone } from "lucide-react";
import { Controller, type Control } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui-elements/field";
import { InputApp } from "@/components/forms";
import { InputDatePicker } from "@/components/forms/Input-date-picker";
import { Section } from "@/components/layout";
import { EmployeeStatusSelect, UserTitleFormSelect } from "@/components/app";
import { useT } from "@/lib/i18n/context";
import type { EmployeeFormSchema } from "../../schemas/employee-form-schema";

interface Props {
  control: Control<EmployeeFormSchema>;
  isEdit: boolean;
}

export function WorkInfoSection({ control, isEdit }: Props) {
  const { dict } = useT();
  const d = dict.system.employees;

  return (
    <Section title={d.sectionWork} tone="violet" meta="7 trường">
      <div className="grid grid-cols-1 gap-y-2.5">
        {/* Chức vụ + Chức danh */}
        <div className="grid grid-cols-2 gap-x-3">
          <UserTitleFormSelect
            name="positionId"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            label={d.positionId ?? "Chức vụ"}
            placeholder={d.positionPlaceholder}
          />

          <InputApp
            name="jobTitle"
            label={d.jobTitle}
            placeholder={d.jobTitlePlaceholder}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            autoComplete="jobTitle"
          />
        </div>

        {/* SĐT + Email công ty */}
        <div className="grid grid-cols-2 gap-x-3">
          <InputApp
            name="workPhone"
            label={d.workPhone}
            placeholder={d.phonePlaceholder}
            icon={Phone}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            autoComplete="workPhone"
          />
          <InputApp
            name="workEmail"
            label={d.workEmail}
            placeholder={d.emailPlaceholder}
            icon={Mail}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            autoComplete="workEmail"
          />
        </div>

        {/* Ngày bắt đầu/kết thúc + Trạng thái (chỉ CREATE) */}
        <div className="grid grid-cols-12 gap-x-3">
          {isEdit ? (
            <>
              <DateField control={control} name="startDate" label={d.startDate} className="col-span-6" />
              <DateField control={control} name="endDate" label={d.endDate} className="col-span-6" />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 col-span-9">
                <DateField control={control} name="startDate" label={d.startDate} />
                <DateField control={control} name="endDate" label={d.endDate} />
              </div>

              <Controller
                name="staffStatusId"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="col-span-3">
                    <FieldLabel>{d.status}</FieldLabel>
                    <EmployeeStatusSelect {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </>
          )}
        </div>
      </div>
    </Section>
  );
}

// ─── Sub: reusable date field with wrapper ───────────────────────────────────

function DateField({
  control,
  name,
  label,
  className,
}: {
  control: Control<EmployeeFormSchema>;
  name: "startDate" | "endDate";
  label: string;
  className?: string;
}) {
  const { dict } = useT();
  const d = dict.system.employees;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel>{label}</FieldLabel>
          <InputDatePicker placeholder={d.datePlaceholder} {...field} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

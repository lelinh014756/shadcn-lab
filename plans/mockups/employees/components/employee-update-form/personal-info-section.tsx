"use client";

/**
 * Section 1: Thông tin cá nhân — 7 fields, layout 4-col.
 *   Mã · Họ tên · Giới tính (Toggle) · Ngày sinh
 *   SĐT · Email · Địa chỉ (col-span-2)
 */

import { Hash, Mail, Phone } from "lucide-react";
import { Controller, type Control } from "react-hook-form";
import dayjs from "dayjs";
import { Field, FieldError, FieldLabel } from "@/components/ui-elements/field";
import { InputApp } from "@/components/forms";
import { InputDatePicker } from "@/components/forms/Input-date-picker";
import { Section, SectionGrid } from "@/components/layout";
import { ToggleGender } from "@/components/toggle/toggle-gender";
import { useT } from "@/lib/i18n/context";
import type { EmployeeFormSchema } from "../../schemas/employee-form-schema";

interface Props {
  control: Control<EmployeeFormSchema>;
  isEdit: boolean;
}

export function PersonalInfoSection({ control, isEdit }: Props) {
  const { dict } = useT();
  const d = dict.system.employees;

  return (
    <Section tone="info" title={d.sectionBasic} meta="7 trường">
      <SectionGrid cols={4}>
        <InputApp
          required
          name="code"
          label={d.code}
          placeholder={d.codePlaceholder}
          icon={Hash}
          disabled={isEdit}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
          autoComplete="code"
        />

        <InputApp
          required
          name="fullName"
          label={d.fullName}
          placeholder={d.fullNamePlaceholder}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
          autoComplete="fullName"
        />

        <Controller
          name="gender"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{d.gender}</FieldLabel>
              <ToggleGender {...field} />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{d.dateOfBirth}</FieldLabel>
              <InputDatePicker
                placeholder={d.datePlaceholder}
                fromYear={1920}
                toYear={dayjs().year()}
                reverseYears
                {...field}
                onSubmit={(val) => field.onChange(val)}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <InputApp
          required
          name="personalPhone"
          label={d.personalPhone}
          placeholder={d.phonePlaceholder}
          icon={Phone}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
          autoComplete="personalPhone"
        />

        <InputApp
          required
          name="personalEmail"
          label={d.personalEmail}
          placeholder={d.emailPlaceholder}
          icon={Mail}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
          autoComplete="personalEmail"
        />

        <InputApp
          name="address"
          label={d.address}
          placeholder="VD: 123 Nguyễn Trãi, Q1, HCM"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
          autoComplete="address"
          groupClassName="col-span-2 md:col-span-2"
        />
      </SectionGrid>
    </Section>
  );
}

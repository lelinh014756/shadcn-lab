"use client";

/**
 * Section 4: Định danh & Thuế/Ngân hàng — 8 fields, layout 4-col.
 *
 *   Loại giấy tờ · Số giấy tờ · Ngày cấp · Nơi cấp
 *   Mã số thuế   · Số TK      · Tên TK   · Ngân hàng
 */

import { Controller, type Control } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui-elements/field";
import { InputApp } from "@/components/forms";
import { InputDatePicker } from "@/components/forms/Input-date-picker";
import { Section, SectionGrid } from "@/components/layout";
import { BankFormSelect } from "@/components/app";
import {
  DocumentTypeFormSelect,
  PlacesOfIssueFormSelect,
} from "@/modules/crm/customers/components";
import type { EmployeeFormSchema } from "../../schemas/employee-form-schema";

interface Props {
  control: Control<EmployeeFormSchema>;
}

export function IdentityBankSection({ control }: Props) {
  return (
    <Section title="Định danh & Thuế/Ngân hàng" tone="success" meta="8 trường">
      <SectionGrid cols={4}>
        {/* Identity */}
        <DocumentTypeFormSelect
          label="Loại giấy tờ"
          name="idtype"
          control={control as never}
        />
        <InputApp
          name="idnumber"
          label="Số giấy tờ"
          placeholder="VD: 079123456789"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
        />
        <Controller
          name="idissuedDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Ngày cấp</FieldLabel>
              <InputDatePicker placeholder="Ngày cấp" {...field} />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <PlacesOfIssueFormSelect
          name="idissuedPlace"
          control={control as never}
          label="Nơi cấp"
        />

        {/* Tax & Banking */}
        <InputApp
          name="taxNumber"
          label="Mã số thuế"
          placeholder="VD: 0312345678"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
        />
        <InputApp
          name="bankAccount"
          label="Số tài khoản"
          placeholder="VD: 19031234567"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
        />
        <InputApp
          name="bankAccountName"
          label="Tên tài khoản"
          placeholder="VD: NGUYEN VAN A"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
        />
        <BankFormSelect
          name="bankCode"
          label="Ngân hàng"
          placeholder="Chọn ngân hàng..."
          control={control as never}
        />
      </SectionGrid>
    </Section>
  );
}

"use client";

/**
 * Section 3: 2 khối địa chỉ song song
 *   - `ContactAddressSection` (main narrow 340px): địa chỉ liên hệ
 *   - `PermanentAddressSection` (aside): địa chỉ thường trú + ghi chú
 *
 * Cả hai đều có province → ward dropdown liên tiếp: chọn province tự động
 * reset ward (`setValue(wardKey, undefined)`).
 */

import { Controller, type UseFormReturn } from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui-elements/field";
import { InputApp } from "@/components/forms";
import TextAreaApp from "@/components/forms/text-area-app";
import { Section, SectionGrid } from "@/components/layout";
import { ProvinceSelect } from "@/components/app/province-select";
import { WardSelectByProvince } from "@/components/app/ward-by-province-select";
import { useT } from "@/lib/i18n/context";
import type { EmployeeFormSchema } from "../../schemas/employee-form-schema";

// ─── Contact address (main narrow) ──────────────────────────────────────────

interface ContactAddressProps {
  form: UseFormReturn<EmployeeFormSchema>;
}

export function ContactAddressSection({ form }: ContactAddressProps) {
  const control = form.control;
  return (
    <Section tone="neutral" title="Địa chỉ liên hệ" meta="4 trường">
      <SectionGrid cols={1}>
        <Controller
          name="contactProvinceId"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Tỉnh/Thành</FieldLabel>
              <ProvinceSelect
                {...field}
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  form.setValue("contactWardId", undefined, {
                    shouldDirty: true,
                  });
                }}
              />
            </Field>
          )}
        />
        <Controller
          name="contactWardId"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Phường/Xã</FieldLabel>
              <WardSelectByProvince
                {...field}
                value={field.value}
                provinceId={form.watch("contactProvinceId")}
              />
            </Field>
          )}
        />
        <TextAreaApp
          name="contactAddress"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
          label="Địa chỉ liên hệ"
          placeholder="VD: 456 Trần Hưng Đạo, P.Mỹ Phước, Q.3, HCM"
          maxLength={200}
          showCounter
          rows={5}
        />
      </SectionGrid>
    </Section>
  );
}

// ─── Permanent address (aside) ──────────────────────────────────────────────

interface PermanentAddressProps {
  form: UseFormReturn<EmployeeFormSchema>;
}

export function PermanentAddressSection({ form }: PermanentAddressProps) {
  const { dict } = useT();
  const d = dict.system.employees;
  const control = form.control;

  return (
    <Section title="Địa chỉ thường trú & Ghi chú" meta="5 trường">
      <SectionGrid cols={2}>
        <Controller
          name="permanentProvinceId"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Tỉnh/Thành</FieldLabel>
              <ProvinceSelect
                {...field}
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  form.setValue("permanentWardId", undefined, {
                    shouldDirty: true,
                  });
                }}
              />
            </Field>
          )}
        />
        <Controller
          name="permanentWardId"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Phường/Xã</FieldLabel>
              <WardSelectByProvince
                {...field}
                value={field.value}
                provinceId={form.watch("permanentProvinceId")}
              />
            </Field>
          )}
        />
        <InputApp
          name="permanentAddress"
          label="Địa chỉ thường trú"
          placeholder="VD: 123 Lê Lợi"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
        />
        <InputApp
          name="addressFull"
          label="Địa chỉ đầy đủ"
          placeholder="VD: 123 Lê Lợi, P.Bến Thành, Q.1, HCM"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
        />

        <div className="col-span-2">
          <TextAreaApp
            name="notes"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            label={d.notes}
            placeholder="Ghi chú thêm..."
            maxLength={200}
            showCounter
            rows={5}
          />
        </div>
      </SectionGrid>
    </Section>
  );
}

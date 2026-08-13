"use client";
import { memo } from "react";
import { User } from "lucide-react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { CommandApp, CommandAppProps, type SelectOption } from "@/components/forms/command-app";
import { FormField } from "@/components/forms/select-field";
import { useEmployeeLookup } from "../hooks/use-employees-query";
import type { StaffLookupParams } from "../services/employees-service";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";

type EmployeeSelectProps = Omit<CommandAppProps<number>, "options"> & {
  excludeIds?: number[];
  lookupParams?: Pick<StaffLookupParams, "organizationId" | "departmentId" | "keyword">;
};

export const EmployeeSelect = memo(function EmployeeSelect(
  { excludeIds, lookupParams, ...props }: EmployeeSelectProps
) {
  const { dict } = useT();
  const { data, isPending } = useEmployeeLookup({ ...lookupParams, excludeIds });

  const options: SelectOption[] = data?.map((e) => ({
    value: e.id,
    label: e.name,
  })) ?? [];

  return (
    <CommandApp
      options={options}
      placeholder={dict.system.select.employee.placeholder}
      searchPlaceholder={dict.system.select.employee.searchPlaceholder}
      isClearable
      icon={<User />}
      isLoading={isPending}
      className="w-54"
      {...props}
    />
  );
});

interface EmployeeFormSelectProps extends Omit<EmployeeSelectProps, "value" | "onChange"> {
  name: Path<FieldValues>;
  control: Control<FieldValues>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  groupClassName?: string;
}

export const EmployeeFormSelect = memo(function EmployeeFormSelect({
  name,
  control,
  label,
  placeholder,
  required,
  disabled,
  className,
  groupClassName,
  excludeIds,
  lookupParams,
}: EmployeeFormSelectProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          required={required}
          invalid={fieldState.invalid}
          error={fieldState.error}
          className={groupClassName}
        >
          <EmployeeSelect
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("w-full", className)}
            excludeIds={excludeIds}
            lookupParams={lookupParams}
          />
        </FormField>
      )}
    />
  );
});
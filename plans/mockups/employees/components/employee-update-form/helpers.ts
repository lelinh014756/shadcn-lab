/**
 * Helpers cho employee update/create form.
 *
 * Chỉ chứa logic pure: build default values từ Employee entity.
 * Không phụ thuộc React hooks.
 */

import dayjs from "dayjs";
import { GENDER_OPTIONS } from "@/components/toggle/toggle-gender";
import { WORK_STATUS_OPTIONS } from "../toggle-work-status";
import type { Employee } from "../../types/employee";
import type { EmployeeFormSchema } from "../../schemas/employee-form-schema";

/**
 * Xây `defaultValues` cho `useForm` từ Employee đang edit (hoặc null cho CREATE).
 * Tất cả field có fallback rõ ràng — không có `undefined` implicit gây warning
 * "controlled/uncontrolled" từ react-hook-form.
 */
export function buildDefaultValues(
  editingEmployee: Employee | null | undefined,
): EmployeeFormSchema {
  return {
    // Core identity
    code: editingEmployee?.code ?? "",
    fullName: editingEmployee?.fullName ?? "",
    gender: editingEmployee?.gender ?? GENDER_OPTIONS[0].value,
    dateOfBirth: editingEmployee?.dateOfBirth ?? "",

    // Personal contact
    personalEmail: editingEmployee?.personalEmail ?? "",
    address: editingEmployee?.address ?? "",
    personalPhone: editingEmployee?.personalPhone ?? "",

    // Work
    startDate: editingEmployee?.startDate ?? dayjs().toISOString(),
    staffStatusId:
      editingEmployee?.staffStatusId ?? WORK_STATUS_OPTIONS[0].value,
    workEmail: editingEmployee?.workEmail ?? "",
    workPhone: editingEmployee?.workPhone ?? "",

    // Organization
    organizationId: editingEmployee?.organizationId ?? undefined,
    managerId: editingEmployee?.managerId ?? undefined,
    departmentId: editingEmployee?.departmentId ?? undefined,

    // Identity
    idtype: editingEmployee?.idtype ?? "",
    idnumber: editingEmployee?.idnumber ?? "",
    idissuedDate: editingEmployee?.idissuedDate ?? "",
    idissuedPlace: editingEmployee?.idissuedPlace ?? "",

    // Permanent address (API v2: int ID)
    permanentAddress: editingEmployee?.permanentAddress ?? "",
    permanentProvinceId: editingEmployee?.permanentProvinceId ?? undefined,
    permanentWardId: editingEmployee?.permanentWardId ?? undefined,
    addressFull: editingEmployee?.addressFull ?? "",

    // Contact address (API v2: new)
    contactAddress: editingEmployee?.contactAddress ?? "",
    contactProvinceId: editingEmployee?.contactProvinceId ?? undefined,
    contactWardId: editingEmployee?.contactWardId ?? undefined,

    // Tax & Banking
    taxNumber: editingEmployee?.taxNumber ?? "",
    bankAccount: editingEmployee?.bankAccount ?? "",
    bankAccountName: editingEmployee?.bankAccountName ?? "",
    bankCode: editingEmployee?.bankCode ?? "",

    notes: editingEmployee?.notes ?? "",
  };
}

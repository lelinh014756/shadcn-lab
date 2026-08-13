// ──────────────────────────────────────────────────────────────────────────────
// src/modules/employees/services/employees.mock.ts
// ──────────────────────────────────────────────────────────────────────────────
// Pure function approach: IIFE with closure for state instead of class

import { saveAs } from "file-saver";
import { utils, write } from "xlsx";
import type { Employee } from "../types/employee";
import type { StaffImportResult } from "../types/staff-import";
import { DEMO_EMPLOYEES } from "../mock/employees.mock";
import type {
  EmployeeListParams,
  ChangeAccountStatusPayload,
  ChangeStaffStatusPayload,
} from "../types/employee-service";
import type { PaginatedResult } from "../../shared/types";
import { EmployeeFormSchema } from "../schemas/employee-form-schema";
import type { ApiResponse } from "@/lib/api/handle-api";
import type { AccountStatusChangeResponse, StaffStatusChangeResponse } from "../types/employee-query";

// ─── Constants ───────────────────────────────────────────────────────────────

const DELAY_MS = 120;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function matches(e: Employee, kw: string): boolean {
  const q = kw.toLowerCase();
  return (
    e.code.toLowerCase().includes(q) ||
    e.fullName.toLowerCase().includes(q) ||
    (e.workEmail?.toLowerCase().includes(q) ?? false)
  );
}

// ─── Mock Service with Closure State ──────────────────────────────────────────
// IIFE (Immediately Invoked Function Expression) tạo closure cho data
// → Dễ reset state cho testing, dễ mocking hơn class

function createMockEmployeesService() {
  // State được "encapsulate" trong closure
  let data: Employee[] = [...DEMO_EMPLOYEES];

  return {
    async getList(params: EmployeeListParams): Promise<PaginatedResult<Employee>> {
      await delay(DELAY_MS);
      let f = data;
      if (params.searchKeyword?.trim())
        f = f.filter((e) => matches(e, params.searchKeyword!));
      if (params.isActive != null && params.isActive !== undefined)
        f = f.filter((e) => e.isActive === params.isActive);
      if (params.departmentId != null)
        f = f.filter((e) => e.departmentId === params.departmentId);
      if (params.organizationId != null)
        f = f.filter((e) => e.organizationId === params.organizationId);

      const totalCount = f.length;
      const start = (params.pageIndex ?? 0) * params.pageSize;
      return {
        items: f.slice(start, start + params.pageSize),
        totalCount,
        pageIndex: params.pageIndex ?? 0,
        pageSize: params.pageSize,
        totalPages: Math.ceil(totalCount / params.pageSize),
      };
    },

    async getById(id: number): Promise<Employee | null> {
      await delay(DELAY_MS);
      return data.find((e) => e.id === id) ?? null;
    },

    async create(payload: EmployeeFormSchema) {
      await delay(DELAY_MS);
      if (!payload.personalEmail.trim()) throw new Error("Email is required");

      const maxId = Math.max(0, ...data.map((e) => e.id));
      const now = new Date().toISOString();

      const newEmployee: Employee = {
        id: maxId + 1,
        code: payload.code,
        fullName: payload.fullName,
        workEmail: payload.workEmail ?? null,
        departmentId: payload.departmentId ?? null,
        departmentName: null,
        organizationId: payload.organizationId ?? null,
        organizationName: null,
        userId: null,
        isActive: true,
        gender: payload.gender ?? null,
        dateOfBirth: payload.dateOfBirth ?? null,
        personalEmail: payload.personalEmail || null,
        personalPhone: payload.personalPhone || null,
        address: payload.address || null,
        idtype: payload.idtype || null,
        idnumber: payload.idnumber || null,
        idissuedDate: payload.idissuedDate || null,
        idissuedPlace: payload.idissuedPlace || null,
        permanentAddress: payload.permanentAddress || null,
        permanentWardId: payload.permanentWardId || null,
        permanentProvinceId: payload.permanentProvinceId || null,
        addressFull: payload.addressFull || null,
        contactAddress: null,
        contactWardId: null,
        contactProvinceId: null,
        positionId: payload.positionId ?? null,
        positionName: null,
        jobTitle: payload.jobTitle ?? null,
        workPhone: payload.workPhone ?? null,
        startDate: payload.startDate ?? null,
        endDate: payload.endDate ?? null,
        deactivateEffectiveDate: null,
        staffStatusId: payload.staffStatusId ?? 1,
        managerId: payload.managerId ?? null,
        managerName: null,
        taxNumber: payload.taxNumber || null,
        bankAccount: payload.bankAccount || null,
        bankAccountName: payload.bankAccountName || null,
        bankCode: payload.bankCode || null,
        userName: null,
        hasLinkedUser: false,
        notes: payload.notes || null,
        createdAt: now,
        createdBy: null,
        createdByName: "",
        updatedAt: now,
        updatedBy: null,
        updatedByName: "",
      };

      data = [newEmployee, ...data];

      return {
        success: true,
        data: newEmployee,
        message: "Tạo mới thành công",
        errors: [],
      };
    },

    async update(
      id: number,
      payload: EmployeeFormSchema,
    ): Promise<ApiResponse<any>> {
      await delay(DELAY_MS);
      const idx = data.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error(`Employee ${id} not found`);

      const now = new Date().toISOString();
      const updatedEmployee = {
        ...data[idx],
        code: payload.code ?? data[idx].code,
        fullName: payload.fullName ?? data[idx].fullName,
        personalEmail: payload.personalEmail ?? data[idx].personalEmail,
        personalPhone: payload.personalPhone ?? data[idx].personalPhone,
        gender: payload.gender ?? data[idx].gender,
        dateOfBirth: payload.dateOfBirth ?? data[idx].dateOfBirth,
        address: payload.address ?? data[idx].address,
        departmentId: payload.departmentId ?? data[idx].departmentId,
        organizationId: payload.organizationId ?? data[idx].organizationId,
        positionId: payload.positionId ?? data[idx].positionId,
        managerId: payload.managerId ?? data[idx].managerId,
        jobTitle: payload.jobTitle ?? data[idx].jobTitle,
        workEmail: payload.workEmail ?? data[idx].workEmail,
        workPhone: payload.workPhone ?? data[idx].workPhone,
        startDate: payload.startDate ?? data[idx].startDate,
        endDate: payload.endDate ?? data[idx].endDate,
        staffStatusId: payload.staffStatusId ?? data[idx].staffStatusId,
        idtype: payload.idtype ?? data[idx].idtype,
        idnumber: payload.idnumber ?? data[idx].idnumber,
        idissuedDate: payload.idissuedDate ?? data[idx].idissuedDate,
        idissuedPlace: payload.idissuedPlace ?? data[idx].idissuedPlace,
        permanentAddress: payload.permanentAddress ?? data[idx].permanentAddress,
        permanentWardId: payload.permanentWardId ?? data[idx].permanentWardId,
        permanentProvinceId: payload.permanentProvinceId ?? data[idx].permanentProvinceId,
        addressFull: payload.addressFull ?? data[idx].addressFull,
        taxNumber: payload.taxNumber ?? data[idx].taxNumber,
        bankAccount: payload.bankAccount ?? data[idx].bankAccount,
        bankAccountName: payload.bankAccountName ?? data[idx].bankAccountName,
        bankCode: payload.bankCode ?? data[idx].bankCode,
        notes: payload.notes ?? data[idx].notes,
        updatedAt: now,
      };
      
      data = data.map((e, i) => (i === idx ? updatedEmployee : e));

      return {
        success: true,
        data: updatedEmployee,
        message: "Cập nhật thành công",
        errors: [],
      };
    },

    async changeAccountStatus(id: number, payload: ChangeAccountStatusPayload): Promise<ApiResponse<AccountStatusChangeResponse>> {
      await delay(DELAY_MS);
      const idx = data.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error(`Employee ${id} not found`);
      data = data.map((e) =>
        e.id === id
          ? { ...e, isActive: !payload.isLocked }
          : e,
      );
      return {
        success: true,
        data: null,
        message: "Cập nhật thành công",
        errors: [],
      };
    },

    async changeStaffStatus(id: number, payload: ChangeStaffStatusPayload): Promise<ApiResponse<StaffStatusChangeResponse>> {
      await delay(DELAY_MS);
      const idx = data.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error(`Employee ${id} not found`);
      data = data.map((e) =>
        e.id === id
          ? { ...e, staffStatusId: payload.staffStatusId }
          : e,
      );
      return {
        success: true,
        data: null,
        message: "Cập nhật thành công",
        errors: [],
      };
    },

    async deleteStaff(id: number): Promise<void> {
      await delay(DELAY_MS);
      data = data.filter((e) => e.id !== id);
    },

    async linkUser(id: number, userId: number): Promise<void> {
      await delay(DELAY_MS);
      const idx = data.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error(`Employee ${id} not found`);
      data = data.map((e, i) =>
        i === idx ? { ...e, userId, hasLinkedUser: true } : e,
      );
    },

    async unlinkUser(id: number): Promise<void> {
      await delay(DELAY_MS);
      const idx = data.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error(`Employee ${id} not found`);
      data = data.map((e, i) =>
        i === idx ? { ...e, userId: null, hasLinkedUser: false } : e,
      );
    },

    async getMyProfile(): Promise<Employee> {
      await delay(DELAY_MS);
      if (data.length === 0) throw new Error("No profile found");
      return data[0]!;
    },

    async downloadImportTemplate(): Promise<void> {
      await delay(DELAY_MS);
      const headers = [
        "Code", "FullName", "Gender", "DateOfBirth", "PersonalEmail", "PersonalPhone", "Address",
        "PositionId", "JobTitle", "WorkEmail", "WorkPhone", "StartDate", "EndDate",
        "OrganizationId", "ManagerId", "DepartmentId", "Idtype", "Idnumber", "IdissuedDate",
        "IdissuedPlace", "PermanentAddress", "PermanentWardCode", "PermanentProvinceCode",
        "PermanentAddressFull", "TaxNumber", "BankAccount", "BankAccountName", "BankCode", "Notes"
      ];
      const ws = utils.aoa_to_sheet([
        headers,
        ["NV001", "Nguyễn Văn A", "Nam", "1990-01-15", "nva@gmail.com", "0901234567", "123 ABC", "1", "Dev", "nva@company.vn", "028123456", "2020-01-01", "", "1", "", "1", "CCCD", "123456789", "2015-01-01", "HCM", "456 DEF", "W01", "P01", "456 DEF HCM", "MST123", "TK123", "Nguyễn Văn A", "VCB", "Ghi chú mẫu"],
      ]);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Staff");
      const buffer = write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }),
        "staff_import_template.xlsx",
      );
    },

    async importFromFile(_file: File): Promise<StaffImportResult> {
      await delay(DELAY_MS);
      return {
        message: "Import thành công (mock)",
        totalRows: 1,
        successCount: 1,
        errorCount: 0,
      };
    },

    /** 
     * Test helper: reset state về demo data.
     * Nếu dùng OOP class, phải expose public method hay implement reset interface.
     * Với closure, có thể trivial add vào object.
     */
    _reset(): void {
      data = [...DEMO_EMPLOYEES];
    },
  } as const;
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const mockEmployeesService = createMockEmployeesService();

// Type inference
export type MockEmployeesService = typeof mockEmployeesService;
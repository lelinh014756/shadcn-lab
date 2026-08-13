import type { Employee } from "./employee";
import type { StaffImportResult } from "./staff-import";
import type { AccountStatusChangeResponse } from "./employee-query";
import type { PaginatedResult, BaseListParams } from "../../shared/types";
import type { ApiResponse } from "@/lib/api/handle-api";

export type EmployeeListParams = BaseListParams & {
  departmentId?: number | null;
  organizationId?: number | null;
  isActive?: boolean | null;
  positionId?: number | null;
  managerId?: number | null;
  searchKeyword?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  staffStatusId?: number | null;
};

/** CreateStaffRequest — api-staff.md */
export type EmployeeCreatePayload = {
  code: string;
  fullName: string;
  email: string;
  phone?: string | null;
  departmentId?: number | null;
  organizationId: number;
  description?: string | null;
};

/** UpdateStaffRequest — api-staff.md */
export type EmployeeUpdatePayload = {
  fullName: string;
  email: string;
  phone?: string | null;
  departmentId?: number | null;
  description?: string | null;
  isActive: boolean;
};

/** PATCH /staff/{id}/account-status payload — ChangeAccountStatusAsync */
export type ChangeAccountStatusPayload = {
  /** true = khoá tài khoản (User.IsActive = false), false = mở khoá */
  isLocked: boolean;
};

/** PATCH /staff/{id}/status payload — ChangeActivateStaffAsync */
export type ChangeStaffStatusPayload = {
  /** ID trạng thái nhân viên: 1 = Đang làm, 2 = Nghỉ phép, 3 = Nghỉ việc */
  staffStatusId: number;
  /** Bắt buộc khi staffStatusId = 3 (Nghỉ việc) */
  reason?: string;
};

export interface IEmployeesService {
  list(params: EmployeeListParams): Promise<PaginatedResult<Employee>>;
  getById(id: number): Promise<Employee | null>;
  create(payload: EmployeeCreatePayload): Promise<Employee>;
  update(id: number, payload: EmployeeUpdatePayload): Promise<Employee>;
  changeAccountStatus(id: number, payload: ChangeAccountStatusPayload): Promise<ApiResponse<AccountStatusChangeResponse>>;
  changeStaffStatus(id: number, payload: ChangeStaffStatusPayload): Promise<ApiResponse<null>>;
  deleteStaff(id: number): Promise<ApiResponse<null>>;
  downloadImportTemplate(): Promise<void>;
  importFromFile(file: File): Promise<StaffImportResult>;
  linkUser(staffId: number, userId: number): Promise<void>;
  unlinkUser(staffId: number): Promise<void>;
  getMyProfile(): Promise<Employee>;
}

/** Payload tạo user rồi link vào nhân viên (POST /users + POST /staff/{id}/link-user). */
export type EmployeeAccountCreatePayload = {
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  password: string;
};

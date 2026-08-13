/**
 * Employee shape — ported from the Material React Table reference module
 * (`plans/mockups/employees/types/employee.ts`), trimmed to the fields the
 * 19 table columns and the detail panel actually read.
 */

export const staffStatuses = [
  { id: 1, label: "Đang làm việc", tone: "success" },
  { id: 2, label: "Tạm nghỉ", tone: "warning" },
  { id: 3, label: "Đã nghỉ việc", tone: "destructive" },
] as const;

export type StaffStatusId = (typeof staffStatuses)[number]["id"];

export const genders = ["Nam", "Nữ", "Khác"] as const;
export type Gender = (typeof genders)[number];

export const idTypes = ["CCCD", "CMND", "Hộ chiếu"] as const;
export type IdType = (typeof idTypes)[number];

export interface Employee {
  // Core
  id: number;
  code: string;
  fullName: string;
  workEmail: string | null;
  personalEmail: string | null;
  departmentId: number | null;
  departmentName: string | null;
  organizationId: number | null;
  organizationName: string | null;
  isActive: boolean;

  // Personal
  gender: Gender | null;
  dateOfBirth: string | null;
  personalPhone: string | null;
  address: string | null;

  // Identity
  idtype: IdType | null;
  idnumber: string | null;
  idissuedDate: string | null;
  idissuedPlace: string | null;

  // Work
  positionId: number | null;
  positionName: string | null;
  jobTitle: string | null;
  workPhone: string | null;
  startDate: string | null;
  endDate: string | null;
  staffStatusId: StaffStatusId;
  managerId: number | null;
  managerName: string | null;

  // Banking / Tax
  taxNumber: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
  bankCode: string | null;

  // Account link
  userName: string | null;
  hasLinkedUser: boolean;

  notes: string | null;

  // Audit
  createdAt: string;
  createdByName: string;
  updatedAt: string | null;
  updatedByName: string;
}

export interface EmployeeLookup {
  id: number;
  name: string;
}

export interface EmployeeFilters {
  searchKeyword?: string;
  organizationId?: number | null;
  departmentId?: number | null;
  positionId?: number | null;
  managerId?: number | null;
  staffStatusId?: number | null;
  isActive?: boolean | null;
}

export interface EmployeeListParams extends EmployeeFilters {
  pageNumber: number;
  pageSize: number;
}

export interface EmployeeListResult {
  items: Employee[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

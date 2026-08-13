/**
 * Public types cho module Employees.
 *
 * Đại diện:
 *   - Domain entities: `Employee`, `StaffLookup`, `FilterParams`
 *   - Service contracts: `IEmployeesService`, payload/response types
 *   - Sub-entities: `StaffDocument`, `StaffSalesHistoryEntry`, import types
 */

// ─── Domain entity ──────────────────────────────────────────────────────────
export type { Employee, FilterParams, StaffLookup } from "./employee";

// ─── Service contracts + payloads ───────────────────────────────────────────
export type {
  ChangeAccountStatusPayload,
  ChangeStaffStatusPayload,
  EmployeeAccountCreatePayload,
  EmployeeCreatePayload,
  EmployeeListParams,
  EmployeeUpdatePayload,
  IEmployeesService,
} from "./employee-service";

// ─── API response markers ───────────────────────────────────────────────────
export type {
  AccountStatusChangeRequest,
  AccountStatusChangeResponse,
  StaffStatusChangeRequest,
  StaffStatusChangeResponse,
} from "./employee-query";

// ─── Sub-entities ───────────────────────────────────────────────────────────
export type * from "./staff-document";
export type * from "./staff-import";
export type * from "./staff-sales-history";

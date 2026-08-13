/**
 * Public hooks cho module Employees.
 *
 * Bao gồm:
 *   - Query hooks: list / detail / lookup / activityLogs / myProfile
 *   - Mutation hooks: create / update / changeStatus / delete / link-user…
 *   - Composite hooks: table instance, list data, excel actions
 *
 * Consumers ngoài module thường chỉ cần import từ `../hooks` (barrel).
 */

// ─── Query key factory (dùng cho invalidation ở nơi khác) ───────────────────
export { employeesKeys } from "./use-employees-query";

// ─── Queries ────────────────────────────────────────────────────────────────
export {
  useEmployeeDetail,
  useEmployeeLookup,
  useEmployeesList,
  useMyProfile,
  useStaffActivityLogs,
} from "./use-employees-query";

// ─── Mutations ──────────────────────────────────────────────────────────────
export {
  useChangeAccountStatus,
  useChangeStaffStatus,
  useCreateEmployee,
  useCreateUser,
  useDeleteStaff,
  useDownloadImportTemplate,
  useImportEmployees,
  useLinkUserToEmployee,
  useUnlinkUser,
  useUpdateEmployee,
  type CreateUserPayload,
} from "./use-employees-query";

// ─── Composite hooks (data fetching, tables, excel) ─────────────────────────
export { useEmployeesListData } from "./use-employees-list-data";
export type {
  EmployeesInfiniteState,
  EmployeesListData,
} from "./use-employees-list-data";

export { useEmployeesInfiniteList } from "./use-employees-infinite-list";
export { useEmployeesTable } from "./use-employees-table";
export { useEmployeesTabTable } from "./use-employees-tab-table";
export { useEmployeesLookups } from "./use-employees-lookups";
export { default as useEmployeesExcel } from "./use-employees-excel";
export { useLinkableUsers } from "./use-link-user-sheet";
export { useStaffDocumentsTable } from "./use-staff-documents-table";
export { useStaffSalesHistoryTable } from "./use-staff-sales-history-table";

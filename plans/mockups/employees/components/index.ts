/**
 * Public component API cho module Employees.
 *
 * Chỉ export các component có khả năng dùng ngoài module (screens hoặc
 * module khác). Sub-components chỉ dùng nội bộ trong module (VD: các *-tab
 * dưới `EmployeesDetailPanel`) giữ private.
 */

// ─── Master-detail composition ──────────────────────────────────────────────
export { EmployeesDetailPanel } from "./employees-detail-panel";
export { EmployeesModals } from "./employees-modals";

// ─── Standalone dialogs / sheets (có thể dùng độc lập từ screen khác) ───────
export { ChangeStaffStatusDialog } from "./change-staff-status-dialog";
export { default as EmployeeDetailSheet } from "./employee-detail-sheet";
export { default as EmployeeUpdateSheet } from "./employee-update-sheet";
export { default as EmployeeLinkUserSheet } from "./employee-link-user-sheet";

// ─── Forms (dùng trong sheet hoặc riêng lẻ) ─────────────────────────────────
export {
  default as EmployeeFilterForm,
  EMPLOYEE_FILTER_FORM_ID,
} from "./employee-filter-form";
export { default as EmployeeUpdateForm, FORM_ID as EMPLOYEE_UPDATE_FORM_ID } from "./employee-update-form";

// ─── Display bits (badge, select) — reusable across modules ─────────────────
export { EmployeeSelect } from "./employee-select";
export { default as EmployeeStatusBadge } from "./employee-status-badge";

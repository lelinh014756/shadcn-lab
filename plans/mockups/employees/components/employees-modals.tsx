"use client";

/**
 * EmployeesModals
 * ---------------
 * Aggregator các sheet/dialog mà employees list screen phải render:
 *   - `EmployeeUpdateSheet`      — CREATE / EDIT
 *   - `EmployeeLinkUserSheet`    — LINK_USER
 *   - `ChangeStaffStatusDialog`  — CHANGE_STATUS
 *
 * Mỗi sub-component tự đọc modal state từ `employeesStore` và tự chạy
 * mutation cần thiết. Consumer (screen) chỉ cần render `<EmployeesModals />`
 * một chỗ — không cần biết chi tiết state/dispatch.
 *
 * Thêm modal mới trong tương lai (VD: bulk import wizard, transfer sheet) →
 * chỉ cần bổ sung ở đây, không đụng screen.
 */

import { useEmployeesContext } from "../context/employees-store";
import { ChangeStaffStatusDialog } from "./change-staff-status-dialog";
import EmployeeLinkUserSheet from "./employee-link-user-sheet";
import EmployeeUpdateSheet from "./employee-update-sheet";

export function EmployeesModals() {
  const modal = useEmployeesContext((s) => s.modals);

  return (
    <>
      <EmployeeUpdateSheet />

      {modal.LINK_USER != null && (
        <EmployeeLinkUserSheet open={Boolean(modal.LINK_USER)} />
      )}

      <ChangeStaffStatusDialog />
    </>
  );
}

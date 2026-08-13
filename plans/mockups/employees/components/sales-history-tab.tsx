"use client";

/**
 * SalesHistoryTab
 * --------------
 * Tab "Lịch sử bán hàng" — hiển thị lịch sử giao dịch của nhân viên (mock data, read-only).
 */

import { AdminDataGrid } from "@/components/data-display/admin-data-grid";
import { useStaffSalesHistoryTable } from "../hooks/use-staff-sales-history-table";
import { MOCK_SALES_HISTORY } from "../mock/staff-sales-history.mock";
import type { Employee } from "../types/employee";

export function SalesHistoryTab({ employee }: { employee: Employee }) {
  const table = useStaffSalesHistoryTable(MOCK_SALES_HISTORY);

  void employee; // reserved for future API integration

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <AdminDataGrid table={table} />
      </div>
    </div>
  );
}

"use client";

/**
 * DocumentsTab
 * ------------
 * Tab "Tài liệu" — hiển thị danh sách tài liệu của nhân viên (mock data, read-only).
 */

import { useMemo } from "react";
import { AdminDataGrid } from "@/components/data-display/admin-data-grid";
import { useStaffDocumentsTable } from "../hooks/use-staff-documents-table";
import { MOCK_DOCUMENTS } from "../mock/staff-documents.mock";
import type { Employee } from "../types/employee";

export function DocumentsTab({ employee }: { employee: Employee }) {
  const table = useStaffDocumentsTable(MOCK_DOCUMENTS);

  void employee; // reserved for future API integration

  return (
    <div className="flex h-full flex-col overflow-hidden ">
      <div className="flex-1 overflow-auto">
        <AdminDataGrid table={table} />
      </div>
    </div>
  );
}

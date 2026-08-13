"use client";

import { Lock, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DataTableActionBar } from "@/components/data-table/toolbar/data-table-action-bar";
import { ActionBarItem } from "@/components/ui/action-bar";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import {
  changeEmployeeAccountStatus,
  deleteEmployee,
  type Employee,
} from "@/mocks/employees";

interface EmployeesActionBarProps {
  table: TableCoreInstance<Employee>;
}

export function EmployeesActionBar({ table }: EmployeesActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;

  const onDeactivate = React.useCallback(() => {
    const ids = rows.map((row) => row.original.id);
    toast.promise(
      Promise.all(ids.map((id) => changeEmployeeAccountStatus(id, true))),
      {
        loading: "Đang cập nhật...",
        success: `Đã ngưng hoạt động ${ids.length} nhân viên`,
        error: "Cập nhật thất bại",
      },
    );
  }, [rows]);

  const onDelete = React.useCallback(() => {
    const ids = rows.map((row) => row.original.id);
    toast.promise(Promise.all(ids.map((id) => deleteEmployee(id))), {
      loading: "Đang xoá...",
      success: `Đã xoá ${ids.length} nhân viên`,
      error: "Xoá thất bại",
    });
    table.toggleAllRowsSelected(false);
  }, [rows, table]);

  return (
    <DataTableActionBar table={table} exportFilename="nhan-vien">
      <ActionBarItem onClick={onDeactivate}>
        <Lock />
        Ngưng hoạt động
      </ActionBarItem>
      <ActionBarItem variant="destructive" onClick={onDelete}>
        <Trash2 />
        Xoá
      </ActionBarItem>
    </DataTableActionBar>
  );
}

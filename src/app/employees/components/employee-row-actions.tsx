"use client";

import type { Row } from "@tanstack/react-table";
import { Ellipsis, Lock, Pencil, Trash2, Unlock } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  changeEmployeeAccountStatus,
  deleteEmployee,
  type Employee,
} from "@/mocks/employees";

interface EmployeeRowActionsProps {
  row: Row<Employee>;
  onEdit: (employee: Employee) => void;
}

export function EmployeeRowActions({ row, onEdit }: EmployeeRowActionsProps) {
  const employee = row.original;
  const [isPending, startTransition] = React.useTransition();

  const onToggleStatus = React.useCallback(() => {
    startTransition(() => {
      toast.promise(
        changeEmployeeAccountStatus(employee.id, employee.isActive),
        {
          loading: "Đang cập nhật...",
          success: employee.isActive
            ? "Đã ngưng hoạt động nhân viên"
            : "Đã kích hoạt lại nhân viên",
          error: "Cập nhật thất bại",
        },
      );
    });
  }, [employee.id, employee.isActive]);

  const onDelete = React.useCallback(() => {
    startTransition(() => {
      toast.promise(deleteEmployee(employee.id), {
        loading: "Đang xoá...",
        success: "Đã xoá nhân viên",
        error: "Xoá thất bại",
      });
    });
  }, [employee.id]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Mở thao tác"
          variant="ghost"
          className="size-8 p-0 data-[state=open]:bg-muted"
          disabled={isPending}
        >
          <Ellipsis className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onEdit(employee)}>
          <Pencil />
          Sửa
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onToggleStatus}>
          {employee.isActive ? <Lock /> : <Unlock />}
          {employee.isActive ? "Ngưng hoạt động" : "Kích hoạt lại"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 />
          Xoá
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

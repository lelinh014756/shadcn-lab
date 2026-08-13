"use client";

/**
 * Feature-level table hook — the analog of `useEmployeesTable` in the MRT
 * reference module (tier 3 of the layering).
 *
 * Its only jobs are: declare the columns, and pass table-level overrides down
 * to `useDataTable`. Data fetching lives in `useEmployeesListData`, presentation
 * defaults live in `useTableCore`, and rendering lives in `<DataTable>`.
 */

import type { ColumnDef, OnChangeFn } from "@tanstack/react-table";
import * as React from "react";

import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { useDataTable } from "@/hooks/use-data-table";
import { formatDate } from "@/lib/format";

/** dd/MM/yyyy — the long-form default overflows the 110px date columns. */
const SHORT_DATE: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

import { tableLocalizationVi } from "@/lib/table/localization";
import type { Employee } from "@/mocks/employees";

import { EmployeeRowActions } from "../components/employee-row-actions";
import { EmployeeStatusBadge } from "../components/employee-status-badge";
import {
  buildEmployeesColumnOrder,
  buildEmployeesColumnPinning,
  buildEmployeesColumnSizing,
  buildEmployeesColumnVisibility,
  type EmployeesTableSettings,
} from "../lib/employees-table-settings";

/** Two-line cell used by the compound columns (emails, phones, id, bank…). */
function StackedCell({
  rows,
}: {
  rows: [label: string, value: string | null | undefined][];
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {rows.map(([label, value]) => (
        <span key={label} className="block truncate">
          <span className="font-normal text-[11px] text-muted-foreground/80">
            {label}:{" "}
          </span>
          {value ?? "—"}
        </span>
      ))}
    </div>
  );
}

function MutedCell({ value }: { value: string | null | undefined }) {
  return (
    <span className="block truncate text-muted-foreground">{value ?? "—"}</span>
  );
}

interface UseEmployeesTableProps {
  data: Employee[];
  rowCount: number;
  settings: EmployeesTableSettings;
  onColumnSizingChange: OnChangeFn<Record<string, number>>;
  onEdit: (employee: Employee) => void;
  onRowClick: (employee: Employee) => void;
  selectedRowId: string | null;
  isLoading: boolean;
  /** Infinite mode drops pagination and the bottom toolbar entirely. */
  mode: "paginated" | "infinite";
  pageCount: number;
  pageSize: number;
}

export function useEmployeesTable({
  data,
  rowCount,
  settings,
  onColumnSizingChange,
  onEdit,
  onRowClick,
  selectedRowId,
  isLoading,
  mode,
  pageCount,
  pageSize,
}: UseEmployeesTableProps): {
  table: TableCoreInstance<Employee>;
} {
  const columns = React.useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        id: "code",
        accessorKey: "code",
        header: "Mã NV",
        size: 90,
        minSize: 72,
        maxSize: 140,
      },
      {
        id: "fullName",
        accessorKey: "fullName",
        header: "Họ tên",
        size: 200,
        minSize: 140,
        cell: ({ cell }) => (
          <span className="block whitespace-nowrap font-semibold text-foreground">
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        id: "emails",
        header: "Email",
        size: 220,
        cell: ({ row }) => (
          <StackedCell
            rows={[
              ["Công ty", row.original.workEmail],
              ["Cá nhân", row.original.personalEmail],
            ]}
          />
        ),
      },
      {
        id: "gender",
        accessorKey: "gender",
        header: "Giới tính",
        size: 80,
        cell: ({ cell }) => <MutedCell value={cell.getValue<string>()} />,
      },
      {
        id: "dateOfBirth",
        accessorKey: "dateOfBirth",
        header: "Ngày sinh",
        size: 110,
        cell: ({ cell }) => (
          <MutedCell value={formatDate(cell.getValue<string>(), SHORT_DATE)} />
        ),
      },
      {
        id: "positionName",
        accessorKey: "positionName",
        header: "Chức vụ",
        size: 120,
        cell: ({ cell }) => <MutedCell value={cell.getValue<string>()} />,
      },
      {
        id: "managerName",
        accessorKey: "managerName",
        header: "Quản lý",
        size: 140,
        cell: ({ cell }) => <MutedCell value={cell.getValue<string>()} />,
      },
      {
        id: "departmentName",
        accessorKey: "departmentName",
        header: "Phòng ban",
        size: 160,
        cell: ({ cell }) => <MutedCell value={cell.getValue<string>()} />,
      },
      {
        id: "phones",
        header: "Điện thoại",
        size: 150,
        cell: ({ row }) => (
          <StackedCell
            rows={[
              ["Công ty", row.original.workPhone],
              ["Cá nhân", row.original.personalPhone],
            ]}
          />
        ),
      },
      {
        id: "jobTitle",
        accessorKey: "jobTitle",
        header: "Chức danh",
        size: 150,
        cell: ({ cell }) => <MutedCell value={cell.getValue<string>()} />,
      },
      {
        id: "organizationName",
        accessorKey: "organizationName",
        header: "Đơn vị",
        size: 140,
        cell: ({ cell }) => <MutedCell value={cell.getValue<string>()} />,
      },
      {
        id: "startDate",
        accessorKey: "startDate",
        header: "Ngày vào",
        size: 110,
        cell: ({ cell }) => (
          <MutedCell value={formatDate(cell.getValue<string>(), SHORT_DATE)} />
        ),
      },
      {
        id: "idInfo",
        header: "CCCD/CMND",
        size: 200,
        cell: ({ row }) => (
          <StackedCell
            rows={[
              ["Loại", row.original.idtype],
              ["Số", row.original.idnumber],
            ]}
          />
        ),
      },
      {
        id: "bankInfo",
        header: "Tài khoản ngân hàng",
        size: 200,
        cell: ({ row }) => (
          <StackedCell
            rows={[
              ["Tên", row.original.bankAccountName],
              ["Ngân hàng", row.original.bankCode],
            ]}
          />
        ),
      },
      {
        id: "staffStatusId",
        accessorKey: "staffStatusId",
        header: "Tình trạng NV",
        size: 130,
        cell: ({ row }) => (
          <EmployeeStatusBadge statusId={row.original.staffStatusId} />
        ),
      },
      {
        id: "isActive",
        accessorKey: "isActive",
        header: "Trạng thái",
        size: 160,
        cell: ({ row }) => (
          <span
            className={
              row.original.isActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }
          >
            {row.original.isActive ? "Hoạt động" : "Ngưng hoạt động"}
          </span>
        ),
      },
      {
        id: "created",
        header: "Ngày tạo",
        size: 170,
        cell: ({ row }) => (
          <StackedCell
            rows={[
              ["Lúc", formatDate(row.original.createdAt, SHORT_DATE)],
              ["Bởi", row.original.createdByName],
            ]}
          />
        ),
      },
      {
        id: "updated",
        header: "Cập nhật",
        size: 170,
        cell: ({ row }) => (
          <StackedCell
            rows={[
              [
                "Lúc",
                row.original.updatedAt
                  ? formatDate(row.original.updatedAt, SHORT_DATE)
                  : null,
              ],
              ["Bởi", row.original.updatedByName || null],
            ]}
          />
        ),
      },
      {
        id: "notes",
        accessorKey: "notes",
        header: "Ghi chú",
        size: 180,
        cell: ({ cell }) => <MutedCell value={cell.getValue<string>()} />,
      },
    ],
    [],
  );

  const isInfinite = mode === "infinite";

  // Settings drive the column layout as *controlled* state. Pushing them in via
  // `initialState` plus imperative setters in an effect loops: `setColumnSizing`
  // calls back into `onColumnSizingChange`, which writes new settings, which
  // re-runs the effect.
  const columnOrder = React.useMemo(
    () => buildEmployeesColumnOrder(settings),
    [settings],
  );
  const columnVisibility = React.useMemo(
    () => buildEmployeesColumnVisibility(settings),
    [settings],
  );
  const columnPinning = React.useMemo(
    () => buildEmployeesColumnPinning(settings),
    [settings],
  );
  const columnSizing = React.useMemo(
    () => buildEmployeesColumnSizing(settings),
    [settings],
  );

  const { table } = useDataTable<Employee>({
    data,
    columns,
    pageCount: isInfinite ? 1 : pageCount,
    rowCount,
    getRowId: (row) => String(row.id),
    localization: tableLocalizationVi,

    initialState: {
      density: "compact",
      pagination: { pageIndex: 0, pageSize },
    },
    state: {
      columnOrder,
      columnVisibility,
      columnPinning,
      columnSizing,
      showProgressBars: isLoading,
    },
    onColumnSizingChange,

    enableRowSelection: settings.showMultiRowSelection,
    enableRowNumbers: true,
    enableRowActions: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    enablePagination: !isInfinite,
    enableBottomToolbar: !isInfinite,
    enableStickyHeader: true,
    enableStickyFooter: settings.showSummaryFooter,

    // The screen owns filters and actions, so the built-in filter row is off.
    enableColumnFilterToggle: false,

    renderRowActions: ({ row }) => (
      <EmployeeRowActions row={row} onEdit={onEdit} />
    ),

    slotProps: {
      bodyRow: ({ row }) => ({
        onClick: () => onRowClick(row.original),
        "data-selected-row": row.id === selectedRowId ? "true" : undefined,
        className:
          row.id === selectedRowId
            ? "cursor-pointer bg-primary/5 shadow-[inset_2px_0_0_0_var(--color-primary)]"
            : "cursor-pointer",
      }),
    },
  });

  return { table };
}

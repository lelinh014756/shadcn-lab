"use client";

import { useMemo } from "react";
import { UserPlus } from "lucide-react";
import {
  type MRT_ColumnDef,
  type MRT_ColumnPinningState,
  type MRT_ColumnSizingState,
  type MRT_PaginationState,
  type MRT_RowVirtualizer,
  type MRT_TableInstance,
} from "material-react-table";
import type { OnChangeFn } from "@tanstack/react-table";
import type { MutableRefObject } from "react";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { MRT_Localization_VI } from "material-react-table/locales/vi";
import { GridEmptyState } from "@/components/data-display/grid-empty-state";
import { StatusBadge } from "@/components/data-display/status-badge";
import EmployeeStatusBadge from "../components/employee-status-badge";
import { getAdminGridSelectableRowProps } from "@/lib/configs/admin-grid-row-selection";
import { useAdminTable, type InfiniteConfig } from "@/lib/hooks/use-admin-table";
import { useT } from "@/lib/i18n/context";
import { formatDisplayDateTime, formatDisplayDate } from "@/modules/projects/utils/project-formatters";
import type { Employee } from "../types/employee";
import ButtonActions, { type ActionItem } from "@/components/button/button-actions";
import { useEmployeesContext } from "../context/employees-store";
import { useChangeAccountStatus, useDeleteStaff } from "./use-employees-query";
import { notifyAdminError, notifyAdminSuccess, resolveErrorMessage } from "@/modules/system/shared/admin-toast-notify";
import {
  buildEmployeesColumnVisibility,
  buildEmployeesMrtColumnOrder,
  buildEmployeesMrtColumnSizing,
  type EmployeesTableSettings,
} from "../lib/employees-table-settings";

type UseEmployeesTableArgs = {
  data: Employee[];
  totalCount: number;
  onRowClick?: (row: Employee) => void;
  selectedRowId?: string | null;
  /** Required — controls MRT state.derive (column order/visibility/sizing). */
  tableSettings: EmployeesTableSettings;
  /** Controlled pinning state — typically from `buildEmployeesColumnPinning(settings)`. */
  columnPinning: MRT_ColumnPinningState;
  /** Required when `columnSizing` is controlled — strip display columns rồi mới write. */
  onColumnSizingChange: OnChangeFn<MRT_ColumnSizingState>;
  pagination: MRT_PaginationState;
  onPaginationChange: OnChangeFn<MRT_PaginationState>;
  /**
   * "paginated" (default) — giữ flow cũ với MRT pagination toolbar.
   * "infinite" — wire `infinite` config để `useAdminTable` bật virtualization + scroll listener.
   */
  mode?: "paginated" | "infinite";
  isLoading?: boolean;
  /**
   * Required khi `mode === "infinite"`. Caller build từ `useEmployeesInfiniteList` result.
   */
  infinite?: Omit<InfiniteConfig<Employee>, "rowVirtualizerInstanceRef"> & {
    rowVirtualizerInstanceRef: MutableRefObject<any>;
  };
};

export function useEmployeesTable({
  data,
  totalCount,
  onRowClick,
  selectedRowId,
  tableSettings,
  columnPinning,
  onColumnSizingChange,
  pagination,
  onPaginationChange,
  mode = "paginated",
  infinite,
  isLoading,
}: UseEmployeesTableArgs): MRT_TableInstance<Employee> {
  const { dict, locale } = useT();
  const d = dict.system.employees;
  const sc = dict.system.common;

  const localization =
    locale === "en" ? MRT_Localization_EN : MRT_Localization_VI;

  const openModal = useEmployeesContext((s) => s.openModal);
  const openEditModal = useEmployeesContext((s) => s.openEditModal);

  const changeAccountStatus = useChangeAccountStatus({
    onSuccess: (_, vars) => {
      const nextKey = vars.payload.isLocked ? "toastDeactivateSuccess" : "toastReactivateSuccess";
      notifyAdminSuccess(dict, d[nextKey]);
    },
    onError: (err, vars) => {
      const nextKey = vars.payload.isLocked ? "toastDeactivateError" : "toastReactivateError";
      notifyAdminError(dict, resolveErrorMessage(err, d[nextKey]));
    },
  });

  const deleteStaff = useDeleteStaff({
    onSuccess: () => notifyAdminSuccess(dict, d.toastDeleteSuccess),
    onError: (err) => notifyAdminError(dict, resolveErrorMessage(err, d.toastDeleteError)),
  });

  const columns = useMemo<MRT_ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "code",
        header: d.code,
        size: 90,
        minSize: 72,
        maxSize: 130,
      },
      {
        accessorKey: "fullName",
        header: d.fullName,
        size: 200,
        minSize: 150,
        grow: true,
        Cell: ({ cell }) => (
          <span className="block whitespace-nowrap text-xs font-semibold text-foreground">
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        id: "emails",
        header: d.email,
        size: 220,
        minSize: 180,
        maxSize: 300,
        Cell: ({ row }) => {
          const { workEmail, personalEmail } = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Công ty: </span>{workEmail ?? "—"}
              </span>
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Cá nhân: </span>{personalEmail ?? "—"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "gender",
        header: d.gender,
        size: 80,
        minSize: 60,
        maxSize: 100,
        Cell: ({ cell }) => (
          <span className="block truncate text-xs text-muted-foreground">
            {cell.getValue<string | null>() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "dateOfBirth",
        header: d.dateOfBirth,
        size: 110,
        minSize: 90,
        maxSize: 140,
        Cell: ({ cell }) => (
          <span className="block truncate text-xs text-muted-foreground">
            {formatDisplayDate(cell.getValue<string | null>() ?? "", locale)}
          </span>
        ),
      },
      {
        accessorKey: "positionName",
        header: d.positionId ?? "Chức vụ",
        size: 120,
        minSize: 90,
        maxSize: 180,
        Cell: ({ cell }) => (
          <span className="block truncate text-xs text-muted-foreground">
            {cell.getValue<string | null>() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "managerName",
        header: d.managerId ?? "Quản lý",
        size: 140,
        minSize: 100,
        maxSize: 200,
        Cell: ({ cell }) => (
          <span className="block truncate text-xs text-muted-foreground">
            {cell.getValue<string | null>() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "departmentName",
        header: d.departmentName,
        size: 160,
        minSize: 110,
        maxSize: 220,
        Cell: ({ cell }) => (
          <span className="block truncate text-xs text-muted-foreground">
            {cell.getValue<string | null>() ?? "—"}
          </span>
        ),
      },
      {
        id: "phones",
        header: d.phone,
        size: 150,
        minSize: 120,
        maxSize: 200,
        Cell: ({ row }) => {
          const { workPhone, personalPhone } = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Công ty: </span>{workPhone ?? "—"}
              </span>
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Cá nhân: </span>{personalPhone ?? "—"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "jobTitle",
        header: d.jobTitle,
        size: 150,
        minSize: 100,
        maxSize: 200,
        Cell: ({ cell }) => (
          <span className="block truncate text-xs text-muted-foreground">
            {cell.getValue<string | null>() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "organizationName",
        header: d.organizationId,
        size: 140,
        minSize: 100,
        maxSize: 200,
        Cell: ({ cell }) => (
          <span className="block truncate text-xs text-muted-foreground">
            {cell.getValue<string | null>() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "startDate",
        header: d.startDate,
        size: 110,
        minSize: 90,
        maxSize: 140,
        Cell: ({ cell }) => (
          <span className="block truncate text-xs text-muted-foreground">
            {formatDisplayDate(cell.getValue<string | null>() ?? "", locale)}
          </span>
        ),
      },
      {
        id: "idInfo",
        header: d.idtype ?? "CCCD/CMND",
        size: 200,
        minSize: 160,
        maxSize: 280,
        Cell: ({ row }) => {
          const { idtype, idnumber } = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Loại: </span>{idtype ?? "—"}
              </span>
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Số: </span>{idnumber ?? "—"}
              </span>
            </div>
          );
        },
      },
      {
        id: "bankInfo",
        header: "Tài khoản ngân hàng",
        size: 200,
        minSize: 160,
        maxSize: 280,
        Cell: ({ row }) => {
          const { bankAccountName, bankCode } = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Tên: </span>{bankAccountName ?? "—"}
              </span>
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Ngân hàng: </span>{bankCode ?? "—"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "staffStatusId",
        header: d.staffStatus ?? "Tình trạng NV",
        size: 130,
        minSize: 100,
        maxSize: 180,
        Cell: ({ row }) => (
          <EmployeeStatusBadge statusId={row.original.staffStatusId} />
        ),
      },
      {
        accessorKey: "isActive",
        header: sc.status,
        size: 160,
        Cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <StatusBadge
              status={isActive ? "active" : "inactive"}
              label={isActive ? sc.active : sc.inactive}
            />
          );
        },
      },
      {
        id: "created",
        header: sc.createdAt ?? "Ngày tạo",
        size: 170,
        minSize: 130,
        maxSize: 230,
        Cell: ({ row }) => {
          const { createdAt, createdByName } = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Lúc: </span>{formatDisplayDateTime(createdAt, locale)}
              </span>
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Bởi: </span>{createdByName ?? "—"}
              </span>
            </div>
          );
        },
      },
      {
        id: "updated",
        header: sc.updatedAt ?? "Cập nhật",
        size: 170,
        minSize: 130,
        maxSize: 230,
        Cell: ({ row }) => {
          const { updatedAt, updatedByName } = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Lúc: </span>{updatedAt ? formatDisplayDateTime(updatedAt, locale) : "—"}
              </span>
              <span className="block truncate">
                <span className="text-[11px] text-muted-foreground/80 font-normal">Bởi: </span>{updatedByName ?? "—"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "notes",
        header: d.notes ?? "Ghi chú",
        size: 180,
        minSize: 120,
        maxSize: 260,
        Cell: ({ cell }) => (
          <span className="block truncate text-xs text-muted-foreground">
            {cell.getValue<string | null>() ?? "—"}
          </span>
        ),
      },
    ],
    [d, sc, locale],
  );

  return useAdminTable<Employee>({
    columns,
    data,
    rowCount: totalCount,
    getRowId: (row) => String(row.id),
    localization,
    enableRowSelection: tableSettings.showMultiRowSelection,
    enableStickyFooter: tableSettings.showSummaryFooter,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableBottomToolbar: mode === "paginated",
    enablePagination: mode === "paginated",
    manualPagination: mode === "paginated",
    onPaginationChange: mode === "paginated" ? onPaginationChange : undefined,
    state: {
      columnOrder: buildEmployeesMrtColumnOrder(tableSettings),
      columnVisibility: buildEmployeesColumnVisibility(tableSettings),
      columnSizing: buildEmployeesMrtColumnSizing(tableSettings),
      columnPinning,
      showSkeletons: isLoading,
      ...(mode === "paginated" ? {} : {}),
    },
    onColumnSizingChange,
    initialState: {
      showGlobalFilter: false,
      pagination: mode === "paginated" ? { pageIndex: 0, pageSize: pagination.pageSize } : undefined,
    },
    muiTableBodyRowProps: onRowClick
      ? ({ row }) =>
        getAdminGridSelectableRowProps({
          isSelected: row.id === selectedRowId,
          onSelect: () => onRowClick(row.original),
        })
      : undefined,
    renderEmptyRowsFallback: () => <GridEmptyState title={sc.empty} />,
    ...(mode === "infinite" && infinite
      ? {
        enableRowSelection: tableSettings.showMultiRowSelection,
        infinite: {
          totalRowCount: infinite.totalRowCount,
          hasNextPage: infinite.hasNextPage,
          isFetchingNextPage: infinite.isFetchingNextPage,
          rowVirtualizerInstanceRef: infinite.rowVirtualizerInstanceRef,
          fetchMoreOnBottomReached: infinite.fetchMoreOnBottomReached,
        },
      }
      : {}),
    renderRowActions: ({ row }) => {
      const employee = row.original;
      const isActive = employee.isActive;

      const items: ActionItem[] = [
        { preset: "EDIT", onClick: (_note) => openEditModal(employee) },
        {
          preset: isActive ? "DEACTIVATE" : "REACTIVATE",
          onClick: (_note) =>
            changeAccountStatus.mutate({
              id: employee.id,
              payload: { isLocked: isActive },
            }),
        },
        {
          preset: "DELETE",
          onClick: (_note) => deleteStaff.mutate(employee.id),
        }
      ];

      return (
        <ButtonActions
          items={items}
          name="Nhân viên"
          entityData={{ id: employee.id, name: employee.fullName }}
          isLoading={changeAccountStatus.isPending || deleteStaff.isPending}
        />
      );
    },
  });
}
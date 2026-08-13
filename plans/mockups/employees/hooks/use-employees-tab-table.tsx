"use client";

import { useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState, MRT_TableInstance } from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { MRT_Localization_VI } from "material-react-table/locales/vi";
import { GridEmptyState } from "@/components/data-display/grid-empty-state";
import { useAdminTable } from "@/lib/hooks/use-admin-table";
import { useT } from "@/lib/i18n/context";
import { useEmployeesList } from "./use-employees-query";
import type { Employee } from "../types/employee";

type UseEmployeesTabTableArgs = {
  organizationId: number;
  pagination: MRT_PaginationState;
  onPaginationChange: (updater: unknown) => void;
};

export function useEmployeesTabTable({
  organizationId,
  pagination,
  onPaginationChange,
}: UseEmployeesTabTableArgs): MRT_TableInstance<Employee> {
  const { dict, locale } = useT();
  const d = dict.system.employees;
  const sc = dict.system.common;

  const localization = locale === "en" ? MRT_Localization_EN : MRT_Localization_VI;

  const { data } = useEmployeesList({
    organizationId,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const columns = useMemo<MRT_ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "code",
        header: d.code,
        size: 90,
        minSize: 72,
        maxSize: 120,
      },
      {
        accessorKey: "fullName",
        header: d.fullName,
        size: 180,
        minSize: 120,
        grow: true,
        Cell: ({ cell }) => (
          <span className="block whitespace-nowrap text-xs font-medium text-foreground">
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: d.email,
        size: 200,
        minSize: 140,
        Cell: ({ cell }) => (
          <span className="text-xs text-muted-foreground">
            {cell.getValue<string | null>() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: d.phone,
        size: 120,
        minSize: 100,
        Cell: ({ cell }) => (
          <span className="text-xs text-muted-foreground">
            {cell.getValue<string | null>() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "positionName",
        header: "Chức vụ",
        size: 140,
        minSize: 100,
        Cell: ({ cell }) => (
          <span className="text-xs text-muted-foreground">
            {cell.getValue<string | null>() ?? "—"}
          </span>
        ),
      },
    ],
    [d]
  );

  return useAdminTable<Employee>({
    columns,
    data: items,
    rowCount: totalCount,
    manualPagination: true,
    getRowId: (row) => String(row.id),
    localization,
    onPaginationChange,
    state: { pagination },
    initialState: {
      columnPinning: { left: ["code", "fullName"], right: [] },
      showGlobalFilter: false,
    },
    renderEmptyRowsFallback: () => <GridEmptyState title={sc.empty} />,
  });
}

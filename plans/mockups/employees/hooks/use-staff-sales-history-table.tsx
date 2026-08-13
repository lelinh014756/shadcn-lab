"use client";

import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { MRT_Localization_VI } from "material-react-table/locales/vi";
import { GridEmptyState } from "@/components/data-display/grid-empty-state";
import { StatusBadge } from "@/components/data-display/status-badge";
import { useAdminTable } from "@/lib/hooks/use-admin-table";
import { useT } from "@/lib/i18n/context";
import type { StaffSalesHistory } from "../types/staff-sales-history";

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

export function useStaffSalesHistoryTable(data: StaffSalesHistory[]) {
  const { dict, locale } = useT();
  const d = dict.system.employees;

  const localization =
    locale === "en" ? MRT_Localization_EN : MRT_Localization_VI;

  const columns = useMemo<MRT_ColumnDef<StaffSalesHistory>[]>(
    () => [
      {
        accessorKey: "transactionType",
        header: d.salesType,
        size: 130,
        minSize: 90,
        maxSize: 180,
      },
      {
        accessorKey: "customerName",
        header: d.salesCustomer,
        size: 160,
        minSize: 100,
        maxSize: 220,
      },
      {
        accessorKey: "productName",
        header: d.salesProduct,
        size: 220,
        minSize: 120,
        grow: true,
      },
      {
        accessorKey: "amount",
        header: d.salesAmount,
        size: 150,
        minSize: 100,
        maxSize: 200,
        Cell: ({ cell }) => (
          <span className="tabular-nums font-medium">
            {formatVND(cell.getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "transactionDate",
        header: d.salesDate,
        size: 120,
        minSize: 90,
        maxSize: 160,
      },
      {
        accessorKey: "contractNumber",
        header: d.salesContract,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: "status",
        header: d.salesStatus,
        size: 110,
        minSize: 90,
        maxSize: 150,
        Cell: ({ cell }) => {
          const status = cell.getValue<"completed" | "pending" | "cancelled">();
          const variant = status === "completed" ? "success" : status === "pending" ? "warning" : "error";
          const label =
            status === "completed" ? "Hoàn thành"
            : status === "pending" ? "Đang xử lý"
            : "Đã hủy";
          return <StatusBadge status={variant} label={label} />;
        },
      },
    ],
    [d],
  );

  return useAdminTable<StaffSalesHistory>({
    columns,
    data,
    rowCount: data.length,
    getRowId: (row) => String(row.id),
    localization,
    initialState: {
      columnPinning: { left: [], right: ["mrt-row-actions"] },
      showGlobalFilter: false,
    },
    renderEmptyRowsFallback: () => <GridEmptyState title={d.salesEmpty} />,
    enableRowActions: false,
    enableStickyHeader: true,
  });
}

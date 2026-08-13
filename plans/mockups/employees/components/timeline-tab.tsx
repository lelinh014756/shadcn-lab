"use client";

/**
 * TimelineTab
 * -----------
 * Tab "Lịch sử thực hiện" — hiển thị activity log của nhân viên (theo userId).
 */

import { useMemo, memo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { MRT_Localization_VI } from "material-react-table/locales/vi";
import { GridEmptyState } from "@/components/data-display/grid-empty-state";
import { StatusBadge } from "@/components/data-display/status-badge";
import { TableSkeleton } from "@/components/feedback/table-skeleton";
import { AdminDataGrid } from "@/components/data-display/admin-data-grid";
import { useAdminTable } from "@/lib/hooks/use-admin-table";
import { useT } from "@/lib/i18n/context";
import { useStaffActivityLogs } from "../hooks/use-employees-query";
import type { Employee } from "../types/employee";
import type { ActivityLogEntry } from "@/modules/activity-log/types/activity-log";

const SKELETON_ROWS = 6;

const ActionBadge = memo(function ActionBadge({ code }: { code: string }) {
  const variant = code.startsWith("CREATE")
    ? "success"
    : code.startsWith("UPDATE")
      ? "info"
      : code.startsWith("DELETE")
        ? "error"
        : "warning";
  return <StatusBadge status={variant} label={code} />;
});
ActionBadge.displayName = "ActionBadge";

export const TimelineTab = memo(function TimelineTab({ employee }: { employee: Employee }) {
  const { dict, locale } = useT();
  const sc = dict.system.common;

  const { data: logResult, isLoading, isFetching } = useStaffActivityLogs(
    employee.id,
  );

  const localization =
    locale === "en" ? MRT_Localization_EN : MRT_Localization_VI;

  const items = useMemo(() => {
    if (!logResult?.ok) return [];
    return logResult.data.items;
  }, [logResult]);

  const columns = useMemo<MRT_ColumnDef<ActivityLogEntry>[]>(
    () => [
      {
        accessorKey: "actionCode",
        header: sc.status,
        size: 130,
        minSize: 90,
        maxSize: 180,
        Cell: ({ cell }) => <ActionBadge code={cell.getValue<string>()} />,
      },
      {
        accessorKey: "actionName",
        header: "Hành động",
        size: 140,
        minSize: 100,
        maxSize: 180,
      },
      {
        accessorKey: "resourceName",
        header: "Đối tượng",
        size: 120,
        minSize: 80,
        maxSize: 160,
      },
      {
        accessorKey: "message",
        header: "Mô tả",
        size: 300,
        minSize: 150,
        grow: true,
      },
      {
        accessorKey: "userName",
        header: "Người thực hiện",
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: "ipAddress",
        header: "IP",
        size: 130,
        minSize: 90,
        maxSize: 160,
      },
      {
        accessorKey: "createdAt",
        header: "Thời gian",
        size: 160,
        minSize: 120,
        maxSize: 200,
      },
    ],
    [sc.status],
  );

  const table = useAdminTable<ActivityLogEntry>({
    columns,
    data: items,
    rowCount: items.length,
    getRowId: (row) => String(row.id),
    localization,
    initialState: {
      columnPinning: { left: [], right: ["mrt-row-actions"] },
      showGlobalFilter: false,
    },
    renderEmptyRowsFallback: () => (
      <GridEmptyState title="Chưa có lịch sử hoạt động" />
    ),
    enableRowActions: false,
    enableStickyHeader: true,
  });

  if (isLoading || isFetching) {
    return (
      <div className="h-full overflow-hidden">
        <TableSkeleton
          rows={SKELETON_ROWS}
          columns={4}
          className="border-0 shadow-none"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <AdminDataGrid table={table} />
      </div>
    </div>
  );
});
TimelineTab.displayName = "TimelineTab";


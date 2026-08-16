"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useDataTable } from "@/components/data-table/hooks/use-data-table";
import { DataTableFilterList } from "@/components/data-table/menus/data-table-filter-list";
import { DataTableFilterMenu } from "@/components/data-table/menus/data-table-filter-menu";
import { DataTableSortList } from "@/components/data-table/menus/data-table-sort-list";
import type {
  DataTableRowAction,
  QueryKeys,
} from "@/components/data-table/types";
import type { Task } from "@/mocks/tasks";
import { DISPLAY_COLUMN_IDS } from "@/types/table";
import { useTasksData } from "../hooks/use-tasks-data";
import { DeleteTasksDialog } from "./delete-tasks-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { TasksTableActionBar } from "./tasks-table-action-bar";
import { getTasksTableColumns, TasksRowActions } from "./tasks-table-columns";
import { UpdateTaskSheet } from "./update-task-sheet";

interface TasksTableProps {
  queryKeys?: Partial<QueryKeys>;
}

export function TasksTable({ queryKeys }: TasksTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags();

  const {
    data,
    pageCount,
    statusCounts,
    priorityCounts,
    estimatedHoursRange,
    isPending,
  } = useTasksData({ enableAdvancedFilter });

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Task> | null>(null);

  const columns = React.useMemo(
    () =>
      getTasksTableColumns({
        statusCounts,
        priorityCounts,
        estimatedHoursRange,
      }),
    [statusCounts, priorityCounts, estimatedHoursRange],
  );

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: [DISPLAY_COLUMN_IDS.actions] },
      // Advanced mode replaces the per-column filter row with its own builder.
      showColumnFilters: !enableAdvancedFilter,
    },
    // The advanced builder owns filtering, so hide the built-in filter toggle.
    enableColumnFilterToggle: !enableAdvancedFilter,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <TasksRowActions row={row} setRowAction={setRowAction} />
    ),
    state: { showProgressBars: isPending },
    queryKeys,
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  if (isPending && data.length === 0) {
    return (
      <DataTableSkeleton
        columnCount={7}
        filterCount={2}
        cellWidths={[
          "10rem",
          "30rem",
          "10rem",
          "10rem",
          "6rem",
          "6rem",
          "6rem",
        ]}
        shrinkZero
      />
    );
  }

  return (
    <>
      <DataTable
        table={table}
        actionBar={<TasksTableActionBar table={table} />}
      >
        <DataTableSortList table={table} align="start" />
        {enableAdvancedFilter &&
          (filterFlag === "advancedFilters" ? (
            <DataTableFilterList
              table={table}
              shallow={shallow}
              debounceMs={debounceMs}
              throttleMs={throttleMs}
              align="start"
            />
          ) : (
            <DataTableFilterMenu
              table={table}
              shallow={shallow}
              debounceMs={debounceMs}
              throttleMs={throttleMs}
            />
          ))}
      </DataTable>
      <UpdateTaskSheet
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        task={rowAction?.row.original ?? null}
      />
      <DeleteTasksDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        tasks={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
}

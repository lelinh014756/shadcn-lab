"use client";

import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportTableToCSV } from "@/lib/export";
import type { Task } from "@/mocks/tasks";
import { DISPLAY_COLUMN_IDS } from "@/types/table";

import { CreateTaskSheet } from "./create-task-sheet";
import { DeleteTasksDialog } from "./delete-tasks-dialog";

interface TasksTableToolbarActionsProps {
  table: Table<Task>;
}

export function TasksTableToolbarActions({
  table,
}: TasksTableToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteTasksDialog
          tasks={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <CreateTaskSheet />
      <Button
        variant="outline"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "tasks",
            excludeColumns: [
              DISPLAY_COLUMN_IDS.select,
              DISPLAY_COLUMN_IDS.actions,
            ],
          })
        }
      >
        <Download />
        Export
      </Button>
      {/**
       * Other actions can be added here.
       * For example, import, view, etc.
       */}
    </div>
  );
}

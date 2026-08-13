"use client";

import type { Row, RowData } from "@tanstack/react-table";

import { TableCell, TableRow } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";

interface DataTableDetailPanelProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
  row: Row<TData>;
}

/** The expanded row content, mirroring MRT's `renderDetailPanel`. */
export function DataTableDetailPanel<TData extends RowData>({
  table,
  row,
}: DataTableDetailPanelProps<TData>) {
  const { renderDetailPanel } = table.options;
  if (!renderDetailPanel) return null;

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={table.getVisibleLeafColumns().length}
        className="bg-muted/30 p-0"
      >
        {renderDetailPanel({ row, table })}
      </TableCell>
    </TableRow>
  );
}

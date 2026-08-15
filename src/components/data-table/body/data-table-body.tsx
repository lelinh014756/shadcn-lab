"use client";

import type { RowData } from "@tanstack/react-table";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { resolveSlotProp } from "@/types/table";

import { DataTableRow } from "./data-table-row";

interface DataTableBodyProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

export function DataTableBody<TData extends RowData>({
  table,
}: DataTableBodyProps<TData>) {
  const { density, columnVisibility, columnPinning, columnOrder } =
    table.getState();
  const {
    enableColumnBorders,
    localization,
    renderEmptyRowsFallback,
    slotProps,
  } = table.options;

  const rows = table.getRowModel().rows;
  const bodyProps = resolveSlotProp(slotProps.body, { table });

  if (rows.length === 0) {
    return (
      <TableBody {...bodyProps}>
        <TableRow className="hover:bg-transparent">
          <TableCell
            colSpan={table.getVisibleLeafColumns().length}
            className="h-24 text-center"
          >
            {renderEmptyRowsFallback?.({ table }) ??
              localization.noRecordsToDisplay}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody {...bodyProps}>
      {rows.map((row) => (
        <DataTableRow
          key={row.id}
          table={table}
          row={row}
          rowProps={resolveSlotProp(slotProps.bodyRow, { table, row })}
          slotProps={slotProps}
          density={density}
          columnVisibility={columnVisibility}
          columnPinning={columnPinning}
          columnOrder={columnOrder}
          enableColumnBorders={enableColumnBorders}
        />
      ))}
    </TableBody>
  );
}

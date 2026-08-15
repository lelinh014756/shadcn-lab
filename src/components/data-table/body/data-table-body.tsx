"use client";

import { flexRender, type RowData } from "@tanstack/react-table";
import * as React from "react";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { getColumnPinningStyle } from "@/lib/table/column-utils";
import { getAlignClass, getDensityCellClass } from "@/lib/table/style-utils";
import { cn } from "@/lib/utils";
import { resolveSlotProp } from "@/types/table";

import { DataTableDetailPanel } from "./data-table-detail-panel";

interface DataTableBodyProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

export function DataTableBody<TData extends RowData>({
  table,
}: DataTableBodyProps<TData>) {
  const { density } = table.getState();
  const {
    enableColumnBorders,
    localization,
    renderDetailPanel,
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
      {rows.map((row) => {
        const rowProps = resolveSlotProp(slotProps.bodyRow, { table, row });

        return (
          <React.Fragment key={row.id}>
            <TableRow
              data-state={row.getIsSelected() ? "selected" : undefined}
              {...rowProps}
            >
              {row.getVisibleCells().map((cell, index, cells) => {
                const cellProps = resolveSlotProp(slotProps.bodyCell, {
                  table,
                  cell,
                });
                const align = cell.column.columnDef.meta?.align;

                return (
                  <TableCell
                    key={cell.id}
                    {...cellProps}
                    style={{
                      ...getColumnPinningStyle({
                        column: cell.column,
                        layoutMode: table.options.layoutMode,
                        withBorder: true,
                      }),
                      ...cellProps?.style,
                    }}
                    className={cn(
                      getDensityCellClass(density),
                      align && getAlignClass(align),
                      // Cột ghim tự vẽ viền bằng box-shadow trong
                      // getColumnPinningStyle (xem comment ở đó) — border-e
                      // ở đây chỉ dành cho cột thường.
                      enableColumnBorders &&
                        index < cells.length - 1 &&
                        !cell.column.getIsPinned() &&
                        "border-e",
                      cellProps?.className,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
            {renderDetailPanel && row.getIsExpanded() && (
              <DataTableDetailPanel table={table} row={row} />
            )}
          </React.Fragment>
        );
      })}
    </TableBody>
  );
}

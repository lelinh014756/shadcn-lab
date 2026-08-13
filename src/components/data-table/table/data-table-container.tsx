"use client";

import type { RowData } from "@tanstack/react-table";

import { DataTableBody } from "@/components/data-table/body/data-table-body";
import { DataTableFooter } from "@/components/data-table/footer/data-table-footer";
import { DataTableHead } from "@/components/data-table/head/data-table-head";
import { TableProgressBar } from "@/components/table/table-progress-bar";
import { Table } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { cn } from "@/lib/utils";
import { resolveSlotProp } from "@/types/table";

interface DataTableContainerProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

/** Scroll box that owns sticky positioning — the analog of MRT_TableContainer. */
export function DataTableContainer<TData extends RowData>({
  table,
}: DataTableContainerProps<TData>) {
  const { showProgressBars } = table.getState();
  const containerProps = resolveSlotProp(table.options.slotProps.container, {
    table,
  });

  // Column pinning positions cells with `left`/`right` offsets derived from
  // `column.getSize()`. Those offsets only line up if the browser honors the
  // same widths, which needs a fixed layout and an explicit total width.
  const hasExplicitSizing =
    table.options.enableColumnResizing === true ||
    table.getState().columnPinning.left?.length ||
    table.getState().columnPinning.right?.length;

  return (
    <div
      data-slot="data-table-container"
      {...containerProps}
      className={cn(
        // `min-h-0 flex-1` makes this the scroll region inside the paper's flex
        // column; without it the container grows to content height and the page
        // scrolls instead, which breaks sticky headers and infinite scroll.
        "relative min-h-0 flex-1 overflow-auto rounded-md border",
        containerProps?.className,
      )}
    >
      <TableProgressBar visible={showProgressBars} />
      <Table
        style={
          hasExplicitSizing
            ? { tableLayout: "fixed", width: table.getTotalSize() }
            : undefined
        }
      >
        <DataTableHead table={table} />
        <DataTableBody table={table} />
        <DataTableFooter table={table} />
      </Table>
    </div>
  );
}

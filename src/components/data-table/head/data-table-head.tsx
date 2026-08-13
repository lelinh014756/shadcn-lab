"use client";

import { flexRender, type RowData } from "@tanstack/react-table";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { getColumnPinningStyle } from "@/lib/table/column-utils";
import { getAlignClass, getDensityHeadClass } from "@/lib/table/style-utils";
import { cn } from "@/lib/utils";
import { resolveSlotProp } from "@/types/table";

interface DataTableHeadProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

export function DataTableHead<TData extends RowData>({
  table,
}: DataTableHeadProps<TData>) {
  const { density } = table.getState();
  const { enableStickyHeader, slotProps } = table.options;

  const headProps = resolveSlotProp(slotProps.head, { table });
  const headRowProps = resolveSlotProp(slotProps.headRow, { table });

  return (
    <TableHeader
      {...headProps}
      className={cn(
        enableStickyHeader && "sticky top-0 z-10 bg-background",
        headProps?.className,
      )}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          {...headRowProps}
          className={cn("hover:bg-transparent", headRowProps?.className)}
        >
          {headerGroup.headers.map((header) => {
            const cellProps = resolveSlotProp(slotProps.headCell, {
              table,
              header,
            });
            const align = header.column.columnDef.meta?.align;

            return (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                {...cellProps}
                style={{
                  ...getColumnPinningStyle({
                    column: header.column,
                    layoutMode: table.options.layoutMode,
                    withBorder: true,
                  }),
                  ...cellProps?.style,
                }}
                className={cn(
                  getDensityHeadClass(density),
                  align && getAlignClass(align),
                  cellProps?.className,
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}

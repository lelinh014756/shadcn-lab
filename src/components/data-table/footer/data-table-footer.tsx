"use client";

import { flexRender, type RowData } from "@tanstack/react-table";

import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { getColumnPinningStyle } from "@/lib/table/column-utils";
import { getAlignClass, getDensityCellClass } from "@/lib/table/style-utils";
import { cn } from "@/lib/utils";
import { resolveSlotProp } from "@/types/table";

interface DataTableFooterProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

/**
 * Summary footer. Rendered only when at least one column declares a `footer`,
 * matching the `showSummaryFooter` behavior of the reference MRT screens.
 */
export function DataTableFooter<TData extends RowData>({
  table,
}: DataTableFooterProps<TData>) {
  const { density } = table.getState();
  const { enableColumnBorders, enableStickyFooter, slotProps } =
    table.options;

  const hasFooter = table
    .getVisibleLeafColumns()
    .some((column) => column.columnDef.footer);

  if (!hasFooter) return null;

  const footerProps = resolveSlotProp(slotProps.footer, { table });
  const footerRowProps = resolveSlotProp(slotProps.footerRow, { table });

  return (
    <TableFooter
      {...footerProps}
      className={cn(
        enableStickyFooter && "sticky bottom-0 z-10",
        footerProps?.className,
      )}
    >
      {table.getFooterGroups().map((footerGroup) => (
        <TableRow key={footerGroup.id} {...footerRowProps}>
          {footerGroup.headers.map((header, index, headers) => {
            const cellProps = resolveSlotProp(slotProps.footerCell, {
              table,
              header,
            });
            const align = header.column.columnDef.meta?.align;

            return (
              <TableCell
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
                  getDensityCellClass(density),
                  "font-semibold",
                  align && getAlignClass(align),
                  // Cột ghim tự vẽ viền bằng box-shadow, xem data-table-body.
                  enableColumnBorders &&
                    index < headers.length - 1 &&
                    !header.column.getIsPinned() &&
                    "border-e",
                  cellProps?.className,
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext(),
                    )}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableFooter>
  );
}

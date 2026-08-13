"use client";

import { flexRender, type Header, type RowData } from "@tanstack/react-table";

import { DataTableColumnResizer } from "@/components/data-table/head/data-table-column-resizer";
import { DataTableHeadMenu } from "@/components/data-table/head/data-table-head-menu";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { getColumnPinningStyle } from "@/lib/table/column-utils";
import { getAlignClass, getDensityHeadClass } from "@/lib/table/style-utils";
import { cn } from "@/lib/utils";
import { getIsDisplayColumn, resolveSlotProp } from "@/types/table";

interface DataTableHeadProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

/**
 * Header string thì bọc dropdown (sắp xếp / ghim / ẩn); header là function thì
 * để nguyên cho caller tự quyết — cùng quy tắc data-grid đang dùng.
 */
function getPlainLabel<TData extends RowData>(
  header: Header<TData, unknown>,
): string | null {
  if (getIsDisplayColumn(header.column.id)) return null;

  const raw = header.column.columnDef.header;
  if (typeof raw === "string") return raw;

  return typeof header.column.columnDef.meta?.label === "string"
    ? header.column.columnDef.meta.label
    : null;
}

export function DataTableHead<TData extends RowData>({
  table,
}: DataTableHeadProps<TData>) {
  const { density } = table.getState();
  const {
    enableColumnResizing,
    enableStickyHeader,
    enableColumnBorders,
    localization,
    slotProps,
  } = table.options;

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
          {headerGroup.headers.map((header, index) => {
            const cellProps = resolveSlotProp(slotProps.headCell, {
              table,
              header,
            });
            const align = header.column.columnDef.meta?.align;
            const label = getPlainLabel(header);
            const isLast = index === headerGroup.headers.length - 1;

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
                  enableColumnBorders && !isLast && "border-e",
                  cellProps?.className,
                )}
              >
                {header.isPlaceholder ? null : label ? (
                  <DataTableHeadMenu
                    header={header}
                    table={table}
                    label={label}
                    localization={localization}
                  />
                ) : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )
                )}
                {enableColumnResizing && header.column.getCanResize() && (
                  <DataTableColumnResizer
                    header={header}
                    table={table}
                    label={label ?? header.column.id}
                  />
                )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}

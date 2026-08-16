"use client";

/**
 * The data table renderer — the analog of MRT's `MRT_TablePaper`.
 *
 * Takes exactly one required prop: the table instance. Toolbars, renderers,
 * localization and slot props are all read off `table.options`, so composing a
 * screen never means threading a dozen loose props through this component.
 *
 *   <DataTable table={table} />
 */

import type { RowData } from "@tanstack/react-table";
import type * as React from "react";

import { DataTableContainer } from "@/components/data-table/table/data-table-container";
import { DataTableBottomToolbar } from "@/components/data-table/toolbar/data-table-bottom-toolbar";
import { DataTableTopToolbar } from "@/components/data-table/toolbar/data-table-top-toolbar";
import { TableProvider } from "@/components/table/table-provider";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { cn } from "@/lib/utils";
import { resolveSlotProp } from "@/types/table";

interface DataTableProps<TData extends RowData>
  extends React.ComponentProps<"div"> {
  table: TableCoreInstance<TData>;
  /** Floating bulk-action bar, shown while rows are selected. */
  actionBar?: React.ReactNode;
}

export function DataTable<TData extends RowData>({
  table,
  actionBar,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  const { isFullScreen } = table.getState();
  const { enableTopToolbar, enableBottomToolbar, renderTopToolbar, slotProps } =
    table.options;

  const paperProps = resolveSlotProp(slotProps.paper, { table });

  return (
    <TableProvider table={table}>
      <div
        data-slot="data-table"
        {...paperProps}
        {...props}
        className={cn(
          "flex w-full flex-col gap-2.5",
          isFullScreen &&
            "fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-background p-4",
          paperProps?.className,
          className,
        )}
      >
        {enableTopToolbar &&
          (renderTopToolbar?.({ table }) ?? (
            <DataTableTopToolbar table={table}>{children}</DataTableTopToolbar>
          ))}
        <DataTableContainer table={table} />
        {enableBottomToolbar && <DataTableBottomToolbar table={table} />}
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </TableProvider>
  );
}

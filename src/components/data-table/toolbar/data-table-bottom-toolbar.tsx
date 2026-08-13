"use client";

import type { RowData } from "@tanstack/react-table";

import { DataTablePagination } from "@/components/data-table/toolbar/data-table-pagination";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { cn } from "@/lib/utils";
import { resolveSlotProp } from "@/types/table";

interface DataTableBottomToolbarProps<TData extends RowData>
  extends React.ComponentProps<"div"> {
  table: TableCoreInstance<TData>;
}

export function DataTableBottomToolbar<TData extends RowData>({
  table,
  className,
  ...props
}: DataTableBottomToolbarProps<TData>) {
  const { renderBottomToolbarCustomActions, slotProps } = table.options;
  const toolbarProps = resolveSlotProp(slotProps.bottomToolbar, { table });

  const customActions = renderBottomToolbarCustomActions?.({ table });
  const showPagination = table.options.enablePagination !== false;

  if (!customActions && !showPagination) return null;

  return (
    <div
      {...toolbarProps}
      {...props}
      className={cn(
        "flex w-full flex-col gap-2",
        toolbarProps?.className,
        className,
      )}
    >
      {customActions}
      {showPagination && <DataTablePagination table={table} />}
    </div>
  );
}

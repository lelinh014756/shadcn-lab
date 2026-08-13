"use client";

/**
 * Top toolbar — replaces the old `data-table-toolbar.tsx` /
 * `data-table-advanced-toolbar.tsx` pair.
 *
 * Layout mirrors MRT: caller-supplied actions on the left, the built-in action
 * cluster on the right. Per-column filters render on the left too, gated by
 * `showColumnFilters` so the filter toggle actually does something.
 */

import type { RowData } from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";

import { DataTableColumnFilter } from "@/components/data-table/inputs/data-table-column-filter";
import { TableGlobalFilterInput } from "@/components/table/table-global-filter-input";
import { TableToolbarInternalButtons } from "@/components/table/table-toolbar-internal-buttons";
import { Button } from "@/components/ui/button";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { cn } from "@/lib/utils";
import { resolveSlotProp } from "@/types/table";

interface DataTableTopToolbarProps<TData extends RowData>
  extends React.ComponentProps<"div"> {
  table: TableCoreInstance<TData>;
}

export function DataTableTopToolbar<TData extends RowData>({
  table,
  className,
  children,
  ...props
}: DataTableTopToolbarProps<TData>) {
  const {
    enableToolbarInternalActions,
    localization,
    renderTopToolbarCustomActions,
    slotProps,
  } = table.options;
  const { showColumnFilters, showGlobalFilter } = table.getState();

  const filterableColumns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table],
  );

  const isFiltered = table.getState().columnFilters.length > 0;
  const onReset = React.useCallback(() => table.resetColumnFilters(), [table]);

  const toolbarProps = resolveSlotProp(slotProps.topToolbar, { table });

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      {...toolbarProps}
      {...props}
      className={cn(
        "flex w-full items-start justify-between gap-2 p-1",
        toolbarProps?.className,
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {showGlobalFilter && <TableGlobalFilterInput table={table} />}
        {showColumnFilters &&
          filterableColumns.map((column) => (
            <DataTableColumnFilter key={column.id} column={column} />
          ))}
        {showColumnFilters && isFiltered && (
          <Button
            aria-label={localization.clearFilters}
            variant="outline"
            className="border-dashed"
            onClick={onReset}
          >
            <X />
            {localization.reset}
          </Button>
        )}
        {children}
      </div>
      <div className="flex items-center gap-2">
        {renderTopToolbarCustomActions?.({ table })}
        {enableToolbarInternalActions && (
          <TableToolbarInternalButtons table={table} />
        )}
      </div>
    </div>
  );
}

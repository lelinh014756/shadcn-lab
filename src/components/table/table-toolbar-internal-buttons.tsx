"use client";

/**
 * The built-in toolbar action cluster, mirroring MRT's
 * `enableToolbarInternalActions`. Each button is individually gated by the
 * matching `enable*` option so a screen can keep the cluster but drop one.
 */

import type { RowData } from "@tanstack/react-table";

import { TableColumnVisibilityMenu } from "@/components/table/table-column-visibility-menu";
import { TableDensityToggle } from "@/components/table/table-density-toggle";
import { TableFilterToggle } from "@/components/table/table-filter-toggle";
import { TableFullscreenToggle } from "@/components/table/table-fullscreen-toggle";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { cn } from "@/lib/utils";

interface TableToolbarInternalButtonsProps<TData extends RowData>
  extends React.ComponentProps<"div"> {
  table: TableCoreInstance<TData>;
}

export function TableToolbarInternalButtons<TData extends RowData>({
  table,
  className,
  children,
  ...props
}: TableToolbarInternalButtonsProps<TData>) {
  const {
    enableColumnFilterToggle,
    enableColumnVisibilityToggle,
    enableDensityToggle,
    enableFullScreenToggle,
    localization,
  } = table.options;

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
      {enableColumnFilterToggle && <TableFilterToggle table={table} />}
      {enableColumnVisibilityToggle && (
        <TableColumnVisibilityMenu
          table={table}
          label={localization.showHideColumns}
          align="end"
        />
      )}
      {enableDensityToggle && <TableDensityToggle table={table} />}
      {enableFullScreenToggle && <TableFullscreenToggle table={table} />}
    </div>
  );
}

"use client";

/**
 * Injects the built-in display columns, mirroring MRT's `useMRT_DisplayColumns`.
 *
 * Order matches MRT: expand → select → numbers → …data… → actions, with
 * `positionActionsColumn` / `positionExpandColumn` able to move the two
 * repositionable ones to the front or back.
 */

import type { ColumnDef, Row, RowData, Table } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { DISPLAY_COLUMN_IDS, type TableLocalization } from "@/types/table";

/**
 * TanStack types accessor columns as `AnyColumnDef<TData>`; a heterogeneous
 * column array cannot be expressed without it.
 */
// biome-ignore lint/suspicious/noExplicitAny: required by TanStack's ColumnDef contract
type AnyColumnDef<TData extends RowData> = ColumnDef<TData, any>;

interface UseTableDisplayColumnsProps<TData extends RowData> {
  columns: AnyColumnDef<TData>[];
  localization: TableLocalization;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  enableRowNumbers?: boolean;
  enableRowActions?: boolean;
  positionActionsColumn?: "first" | "last";
  positionExpandColumn?: "first" | "last";
  renderRowActions?: (context: {
    row: Row<TData>;
    table: Table<TData>;
  }) => React.ReactNode;
  renderDetailPanel?: (context: {
    row: Row<TData>;
    table: Table<TData>;
  }) => React.ReactNode;
}

function buildSelectColumn<TData extends RowData>(
  localization: TableLocalization,
): AnyColumnDef<TData> {
  return {
    id: DISPLAY_COLUMN_IDS.select,
    size: 40,
    minSize: 40,
    maxSize: 40,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableColumnFilter: false,
    meta: { label: localization.select, align: "center" },
    header: ({ table }) => (
      <Checkbox
        aria-label={localization.toggleSelectAll}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={localization.toggleSelectRow}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  };
}

function buildRowNumbersColumn<TData extends RowData>(
  localization: TableLocalization,
): AnyColumnDef<TData> {
  return {
    id: DISPLAY_COLUMN_IDS.numbers,
    size: 52,
    minSize: 52,
    maxSize: 72,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableColumnFilter: false,
    meta: { label: localization.rowNumbers, align: "center" },
    header: () => localization.rowNumber,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      // Continue numbering across pages when pagination is manual/server-side.
      const offset = table.options.manualPagination ? pageIndex * pageSize : 0;
      return offset + row.index + 1;
    },
  };
}

function buildExpandColumn<TData extends RowData>(
  localization: TableLocalization,
): AnyColumnDef<TData> {
  return {
    id: DISPLAY_COLUMN_IDS.expand,
    size: 40,
    minSize: 40,
    maxSize: 40,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableColumnFilter: false,
    meta: { label: localization.expand, align: "center" },
    header: () => null,
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          type="button"
          aria-label={localization.expand}
          aria-expanded={row.getIsExpanded()}
          className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent"
          onClick={row.getToggleExpandedHandler()}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
      ) : null,
  };
}

function buildActionsColumn<TData extends RowData>(
  localization: TableLocalization,
  renderRowActions: NonNullable<
    UseTableDisplayColumnsProps<TData>["renderRowActions"]
  >,
): AnyColumnDef<TData> {
  return {
    id: DISPLAY_COLUMN_IDS.actions,
    // 3 × 24px buttons + 2 × 8px gaps + 2 × 12px padding
    size: 120,
    minSize: 112,
    maxSize: 160,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableColumnFilter: false,
    meta: { label: localization.actions, align: "center" },
    header: () => localization.actions,
    cell: ({ row, table }) => renderRowActions({ row, table }),
  };
}

export function useTableDisplayColumns<TData extends RowData>({
  columns,
  localization,
  enableRowSelection,
  enableRowNumbers,
  enableRowActions,
  positionActionsColumn = "last",
  positionExpandColumn = "first",
  renderRowActions,
  renderDetailPanel,
}: UseTableDisplayColumnsProps<TData>): AnyColumnDef<TData>[] {
  return React.useMemo(() => {
    const leading: AnyColumnDef<TData>[] = [];
    const trailing: AnyColumnDef<TData>[] = [];

    if (renderDetailPanel) {
      const expandColumn = buildExpandColumn<TData>(localization);
      (positionExpandColumn === "first" ? leading : trailing).push(
        expandColumn,
      );
    }

    if (enableRowSelection) {
      leading.push(buildSelectColumn<TData>(localization));
    }

    if (enableRowNumbers) {
      leading.push(buildRowNumbersColumn<TData>(localization));
    }

    if (enableRowActions && renderRowActions) {
      const actionsColumn = buildActionsColumn<TData>(
        localization,
        renderRowActions,
      );
      (positionActionsColumn === "first" ? leading : trailing).push(
        actionsColumn,
      );
    }

    // Caller-provided display columns win — do not inject a duplicate id.
    const existingIds = new Set(columns.map((column) => column.id));
    const keep = (column: AnyColumnDef<TData>) =>
      !column.id || !existingIds.has(column.id);

    return [...leading.filter(keep), ...columns, ...trailing.filter(keep)];
  }, [
    columns,
    localization,
    enableRowSelection,
    enableRowNumbers,
    enableRowActions,
    positionActionsColumn,
    positionExpandColumn,
    renderRowActions,
    renderDetailPanel,
  ]);
}

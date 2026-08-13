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

import { getTableSelectColumn } from "@/components/table/table-select-column";
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

/**
 * Một cột duy nhất cho STT và ô chọn dòng.
 *
 * Tách làm hai cột thì tắt "chọn nhiều dòng" sẽ mất luôn STT, mà để cạnh nhau
 * lại tốn hai cột cho cùng một chỗ. Gộp lại: STT hiện mặc định, hover hoặc khi
 * dòng được chọn mới đổi thành checkbox — giống hệt data-grid.
 */
function buildSelectColumn<TData extends RowData>({
  localization,
  enableRowNumbers,
  enableRowSelection,
}: {
  localization: TableLocalization;
  enableRowNumbers: boolean;
  enableRowSelection: boolean;
}): AnyColumnDef<TData> {
  // Vừa số vừa checkbox cần rộng hơn ô chọn thuần.
  const size = enableRowNumbers ? 52 : 40;

  return getTableSelectColumn<TData>({
    id: DISPLAY_COLUMN_IDS.select,
    size,
    minSize: size,
    maxSize: enableRowNumbers ? 72 : 40,
    enableRowMarkers: enableRowNumbers,
    readOnly: !enableRowSelection,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableColumnFilter: false,
    meta: {
      label: enableRowSelection ? localization.select : localization.rowNumbers,
      align: "center",
    },
  }) as AnyColumnDef<TData>;
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

    // Một cột lo cả STT lẫn ô chọn; chỉ bỏ hẳn khi tắt cả hai.
    if (enableRowSelection || enableRowNumbers) {
      leading.push(
        buildSelectColumn<TData>({
          localization,
          enableRowNumbers: !!enableRowNumbers,
          enableRowSelection: !!enableRowSelection,
        }),
      );
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

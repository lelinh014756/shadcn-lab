"use client";

import type { RowData } from "@tanstack/react-table";
import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { getColumnPinningStyle } from "@/lib/table/column-utils";
import { getDensityCellClass } from "@/lib/table/style-utils";
import { cn } from "@/lib/utils";
import { resolveSlotProp } from "@/types/table";

import { DataTableRow } from "./data-table-row";

interface DataTableBodyProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

/**
 * Một hàng giả, dùng đúng cột (thứ tự, ghim, độ rộng) của bảng thật nhưng
 * thay nội dung ô bằng thanh `Skeleton` — để cột không "nhảy" khi dữ liệu
 * thật load xong và thay chỗ.
 */
function DataTableSkeletonRow<TData extends RowData>({
  table,
  enableColumnBorders,
}: {
  table: TableCoreInstance<TData>;
  enableColumnBorders: boolean;
}) {
  const { density } = table.getState();
  const columns = table.getVisibleLeafColumns();

  return (
    <TableRow className="hover:bg-transparent">
      {columns.map((column, index) => (
        <TableCell
          key={column.id}
          style={{
            ...getColumnPinningStyle({ column, withBorder: true }),
            width: `calc(var(--col-${column.id}-size) * 1px)`,
          }}
          className={cn(
            getDensityCellClass(density),
            enableColumnBorders &&
              index < columns.length - 1 &&
              !column.getIsPinned() &&
              "border-e",
          )}
        >
          {/* Độ rộng xen kẽ (60/75/45%) để dãy thanh trông tự nhiên, không
              đều tăm tắp như một khối duy nhất lặp lại. */}
          <Skeleton
            className={cn(
              "h-4",
              index % 3 === 0 ? "w-3/5" : index % 3 === 1 ? "w-3/4" : "w-9/20",
            )}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTableBody<TData extends RowData>({
  table,
}: DataTableBodyProps<TData>) {
  const {
    density,
    columnVisibility,
    columnPinning,
    columnOrder,
    showSkeletons,
  } = table.getState();
  const {
    activeRowId,
    enableColumnBorders,
    localization,
    renderEmptyRowsFallback,
    slotProps,
  } = table.options;

  const bodyProps = resolveSlotProp(slotProps.body, { table });

  if (showSkeletons) {
    // Không có dữ liệu thật để đếm hàng — lấy pageSize làm số hàng giả, vừa
    // khít với những gì người dùng sắp thấy khi tải xong.
    const skeletonRowCount = table.getState().pagination.pageSize || 10;

    return (
      <TableBody {...bodyProps}>
        {Array.from({ length: skeletonRowCount }, (_, index) => (
          <DataTableSkeletonRow
            // biome-ignore lint/suspicious/noArrayIndexKey: hàng giả tĩnh, không có id thật để dùng làm key.
            key={index}
            table={table}
            enableColumnBorders={enableColumnBorders}
          />
        ))}
      </TableBody>
    );
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <TableBody {...bodyProps}>
        <TableRow className="hover:bg-transparent">
          <TableCell
            colSpan={table.getVisibleLeafColumns().length}
            className="h-24 text-center"
          >
            {renderEmptyRowsFallback?.({ table }) ??
              localization.noRecordsToDisplay}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody {...bodyProps}>
      {rows.map((row) => (
        <DataTableRow
          key={row.id}
          table={table}
          row={row}
          rowProps={resolveSlotProp(slotProps.bodyRow, { table, row })}
          slotProps={slotProps}
          density={density}
          columnVisibility={columnVisibility}
          columnPinning={columnPinning}
          columnOrder={columnOrder}
          enableColumnBorders={enableColumnBorders}
          // Chụp tại đây, ở mỗi lần render, để `DataTableRow` có giá trị cũ/mới
          // thật sự mà so. Gọi getter bên trong comparator là vô nghĩa — xem
          // chú thích đầu data-table-row.tsx.
          isSelected={row.getIsSelected()}
          isExpanded={row.getIsExpanded()}
          isActive={activeRowId != null && row.id === activeRowId}
        />
      ))}
    </TableBody>
  );
}

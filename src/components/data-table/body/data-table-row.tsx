"use client";

/**
 * Một hàng dữ liệu, tách riêng và bọc `React.memo`.
 *
 * ⚠️ QUY TẮC BẮT BUỘC KHI SỬA COMPARATOR Ở CUỐI FILE ⚠️
 *
 * Không bao giờ so sánh bằng cách gọi getter của TanStack (`row.getIsSelected()`,
 * `row.getIsExpanded()`, `column.getSize()`...). Những getter đó đọc state HIỆN
 * TẠI của table instance — mà instance thì ổn định qua các lần render — nên
 * `prev.row.getX()` và `next.row.getX()` luôn trả về CÙNG một giá trị. Không có
 * "giá trị cũ" nào để so, phép so luôn bằng nhau, và hàng sẽ không bao giờ
 * re-render dù state đã đổi.
 *
 * Muốn so cái gì thì cha phải chụp lại (snapshot) thành prop nguyên thuỷ tại
 * thời điểm render — xem `isSelected` / `isExpanded` bên dưới. Khi đó `prev` giữ
 * giá trị của lần render trước, `next` giữ giá trị lần này, và phép so mới có
 * nghĩa.
 *
 * Vì sao có memo: `columnSizing` đổi khi kéo resize làm cả cây re-render. Width
 * đã đi qua CSS var (xem `useColumnSizeVars`) nên nội dung hàng không phụ thuộc
 * `columnSizing`/`columnSizingInfo` — comparator cố tình bỏ qua hai state đó.
 */

import {
  type ColumnOrderState,
  type ColumnPinningState,
  flexRender,
  type Row,
  type RowData,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { getColumnPinningStyle } from "@/lib/table/column-utils";
import { getAlignClass, getDensityCellClass } from "@/lib/table/style-utils";
import { cn } from "@/lib/utils";
import {
  type Density,
  resolveSlotProp,
  type SlotElementProps,
  type TableSlotProps,
} from "@/types/table";

import { DataTableDetailPanel } from "./data-table-detail-panel";

interface DataTableRowProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
  row: Row<TData>;
  /** Kết quả `resolveSlotProp(slotProps.bodyRow, ...)` — cha đã tính sẵn. */
  rowProps: SlotElementProps | undefined;
  slotProps: TableSlotProps<TData>;
  density: Density;
  columnVisibility: VisibilityState;
  columnPinning: ColumnPinningState;
  columnOrder: ColumnOrderState;
  enableColumnBorders: boolean;
  /** Cha chụp `row.getIsSelected()` — xem chú thích đầu file, đừng gọi getter. */
  isSelected: boolean;
  /** Cha chụp `row.getIsExpanded()` — xem chú thích đầu file, đừng gọi getter. */
  isExpanded: boolean;
}

/**
 * So sánh nông, bỏ qua key có giá trị là function.
 *
 * `slotProps.bodyRow` là closure nên `onClick` luôn là reference MỚI mỗi lần
 * gọi lại — nhưng hành vi bên trong (gọi `onRowClick(row.original)`) không
 * đổi trừ khi `row.original` đổi, và điều đó đã được so riêng ở comparator
 * chính. So sánh các field còn lại (className, data-* ...) bằng giá trị vẫn
 * bắt đúng thay đổi thật (vd đổi dòng đang chọn để xem chi tiết).
 */
function areRowSlotPropsEqual(
  prev: SlotElementProps | undefined,
  next: SlotElementProps | undefined,
): boolean {
  if (prev === next) return true;
  if (!prev || !next) return false;

  const prevEntries = Object.entries(prev);
  if (prevEntries.length !== Object.keys(next).length) return false;

  for (const [key, prevValue] of prevEntries) {
    const nextValue = (next as Record<string, unknown>)[key];
    if (typeof prevValue === "function" && typeof nextValue === "function") {
      continue;
    }
    if (!Object.is(prevValue, nextValue)) return false;
  }

  return true;
}

function DataTableRowImpl<TData extends RowData>({
  table,
  row,
  rowProps,
  slotProps,
  density,
  columnVisibility,
  columnPinning,
  columnOrder,
  enableColumnBorders,
  isSelected,
  isExpanded,
}: DataTableRowProps<TData>) {
  const { renderDetailPanel } = table.options;

  // biome-ignore lint/correctness/useExhaustiveDependencies: columnVisibility/columnPinning/columnOrder điều khiển việc TanStack tính lại danh sách cell hiển thị, không phải reference của `row`.
  const cells = React.useMemo(
    () => row.getVisibleCells(),
    [row, columnVisibility, columnPinning, columnOrder],
  );

  return (
    <>
      <TableRow
        data-state={isSelected ? "selected" : undefined}
        {...rowProps}
      >
        {cells.map((cell, index) => {
          const cellProps = resolveSlotProp(slotProps.bodyCell, {
            table,
            cell,
          });
          const align = cell.column.columnDef.meta?.align;

          return (
            <TableCell
              key={cell.id}
              {...cellProps}
              style={{
                ...getColumnPinningStyle({
                  column: cell.column,
                  withBorder: true,
                }),
                // Qua CSS var (useColumnSizeVars) — chuỗi này không đổi qua
                // các lần render, chỉ giá trị biến đổi, nên trình duyệt tự lo
                // phần resize mà không cần React ghi lại DOM của cell.
                width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                ...cellProps?.style,
              }}
              className={cn(
                getDensityCellClass(density),
                align && getAlignClass(align),
                // Cột ghim tự vẽ viền bằng box-shadow trong
                // getColumnPinningStyle — border-e ở đây chỉ dành cho cột
                // thường.
                enableColumnBorders &&
                  index < cells.length - 1 &&
                  !cell.column.getIsPinned() &&
                  "border-e",
                cellProps?.className,
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
      </TableRow>
      {renderDetailPanel && isExpanded && (
        <DataTableDetailPanel table={table} row={row} />
      )}
    </>
  );
}

export const DataTableRow = React.memo(DataTableRowImpl, (prev, next) => {
  if (prev.row.id !== next.row.id) return false;
  if (prev.row.original !== next.row.original) return false;
  // Snapshot do cha chụp, KHÔNG phải getter — xem chú thích đầu file.
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.isExpanded !== next.isExpanded) return false;
  if (prev.density !== next.density) return false;
  if (prev.columnVisibility !== next.columnVisibility) return false;
  if (prev.columnPinning !== next.columnPinning) return false;
  if (prev.columnOrder !== next.columnOrder) return false;
  if (prev.enableColumnBorders !== next.enableColumnBorders) return false;
  if (!areRowSlotPropsEqual(prev.rowProps, next.rowProps)) return false;

  // Props coi như bằng nhau — bỏ qua re-render (đúng lúc đang resize).
  return true;
}) as typeof DataTableRowImpl;

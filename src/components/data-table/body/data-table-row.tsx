"use client";

/**
 * Một hàng dữ liệu, tách riêng và bọc `React.memo` để resize cột mượt.
 *
 * Vấn đề trước khi tách: `columnSizing` đổi khi kéo resize → `table` (từ
 * `useReactTable`) đổi reference → nếu hàng được render trực tiếp trong
 * `DataTableBody.map()`, TOÀN BỘ hàng re-render mỗi khung hình khi kéo — với
 * 20 hàng × ~19 cột là ~380 lần gọi lại renderer từng cell (badge, format
 * ngày...) MỖI LẦN chuột nhích 1px, đủ để giật hình.
 *
 * Vì width giờ đi qua CSS var (xem `useColumnSizeVars`), nội dung hàng không
 * còn phụ thuộc `columnSizing`/`columnSizingInfo` nữa. Comparator dưới đây CỐ
 * TÌNH không so sánh 2 state đó — resize không kích hoạt re-render hàng, chỉ
 * những thay đổi thực sự ảnh hưởng hiển thị (chọn dòng, mở rộng, ẩn/hiện cột,
 * ghim, thứ tự cột, mật độ, class/onClick của hàng) mới cho re-render.
 */

import {
  flexRender,
  type ColumnOrderState,
  type ColumnPinningState,
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
        data-state={row.getIsSelected() ? "selected" : undefined}
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
      {renderDetailPanel && row.getIsExpanded() && (
        <DataTableDetailPanel table={table} row={row} />
      )}
    </>
  );
}

export const DataTableRow = React.memo(DataTableRowImpl, (prev, next) => {
  if (prev.row.id !== next.row.id) return false;
  if (prev.row.original !== next.row.original) return false;
  if (prev.row.getIsSelected() !== next.row.getIsSelected()) return false;
  if (prev.row.getIsExpanded() !== next.row.getIsExpanded()) return false;
  if (prev.density !== next.density) return false;
  if (prev.columnVisibility !== next.columnVisibility) return false;
  if (prev.columnPinning !== next.columnPinning) return false;
  if (prev.columnOrder !== next.columnOrder) return false;
  if (prev.enableColumnBorders !== next.enableColumnBorders) return false;
  if (!areRowSlotPropsEqual(prev.rowProps, next.rowProps)) return false;

  // Props coi như bằng nhau — bỏ qua re-render (đúng lúc đang resize).
  return true;
}) as typeof DataTableRowImpl;

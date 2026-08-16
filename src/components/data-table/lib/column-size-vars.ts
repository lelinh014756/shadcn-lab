/**
 * Tính toàn bộ biến CSS mô tả hình học cột của bảng.
 *
 * Tách thành hàm thuần vì có HAI nơi cần cùng một phép tính:
 *
 *   1. `useColumnSizeVars` — đường React bình thường, chạy khi state đổi.
 *   2. `useColumnResize` — đường mệnh lệnh trong lúc kéo, ghi thẳng vào
 *      `style` của container để KHÔNG phải re-render React frame nào.
 *
 * Tham số `overrides` phục vụ đúng trường hợp (2): lúc đang kéo, kích thước
 * mới chưa nằm trong state TanStack, nên truyền đè vào đây để tính ra hình
 * học của khung hình kế tiếp mà không cần commit state.
 *
 * Các biến sinh ra:
 *   --table-total-size   tổng độ rộng bảng (cho `table-layout: fixed`)
 *   --header-{id}-size   độ rộng ô header (header có thể gộp nhiều cột)
 *   --col-{id}-size      độ rộng cột
 *   --col-{id}-start     offset `left` của cột ghim trái (cộng dồn)
 *   --col-{id}-end       offset `right` của cột ghim phải (cộng dồn)
 *
 * Hai biến offset tồn tại vì cột ghim định vị `sticky` theo tổng độ rộng của
 * các cột ghim đứng trước nó. Nếu để `column.getStart("left")` trả số px như
 * trước, offset chỉ đúng sau khi React render lại — tức là kéo cột ghim sẽ
 * không thể mượt. Đẩy nốt offset qua biến CSS thì trình duyệt tự cascade.
 */

import type { RowData, Table } from "@tanstack/react-table";

export type ColumnSizeVars = Record<string, number>;

export function computeColumnSizeVars<TData extends RowData>(
  table: Table<TData>,
  overrides?: Record<string, number>,
): ColumnSizeVars {
  const sizeOf = (columnId: string, fallback: number) =>
    overrides?.[columnId] ?? fallback;

  const vars: ColumnSizeVars = {};
  const leafColumns = table.getVisibleLeafColumns();

  let totalSize = 0;
  for (const column of leafColumns) {
    const size = sizeOf(column.id, column.getSize());
    vars[`--col-${column.id}-size`] = size;
    totalSize += size;
  }
  vars["--table-total-size"] = totalSize;

  for (const header of table.getFlatHeaders()) {
    const leaves = header.column.getLeafColumns();
    vars[`--header-${header.id}-size`] =
      leaves.length > 1
        ? leaves.reduce((sum, leaf) => sum + sizeOf(leaf.id, leaf.getSize()), 0)
        : sizeOf(header.column.id, header.column.getSize());
  }

  // Ghim trái cộng dồn từ mép trái; ghim phải cộng dồn ngược từ mép phải.
  let startOffset = 0;
  for (const column of leafColumns) {
    if (column.getIsPinned() !== "left") continue;
    vars[`--col-${column.id}-start`] = startOffset;
    startOffset += vars[`--col-${column.id}-size`] ?? 0;
  }

  let endOffset = 0;
  for (let index = leafColumns.length - 1; index >= 0; index--) {
    const column = leafColumns[index];
    if (!column || column.getIsPinned() !== "right") continue;
    vars[`--col-${column.id}-end`] = endOffset;
    endOffset += vars[`--col-${column.id}-size`] ?? 0;
  }

  return vars;
}

/**
 * Tính toàn bộ biến CSS mô tả hình học cột của bảng.
 *
 * Tách thành hàm thuần vì có HAI nơi cần cùng một phép tính:
 *
 *   1. `useColumnSizeVars` — đường React bình thường, chạy khi state đổi.
 *   2. `useColumnResize` — đường mệnh lệnh trong lúc kéo, ghi thẳng vào
 *      `style` của container để KHÔNG phải re-render React frame nào.
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

import type { Column, RowData, Table } from "@tanstack/react-table";

import { getIsDisplayColumn } from "@/types/table";

export type ColumnSizeVars = Record<string, number>;

interface ComputeColumnSizeVarsOptions {
  /**
   * Đè kích thước cho một vài cột mà KHÔNG commit vào state TanStack — phục vụ
   * lúc đang kéo resize, để tính hình học của khung hình kế tiếp.
   *
   * Cột nằm trong đây cũng bị loại khỏi việc giãn đều (xem `availableWidth`):
   * người dùng đang chỉ định tay độ rộng của nó, giãn thêm là chống lại thao
   * tác kéo.
   */
  overrides?: Record<string, number>;
  /**
   * Bề rộng khả dụng của vùng cuộn. Truyền vào thì tổng các cột hụt so với nó
   * sẽ được chia đều theo tỉ lệ cho các cột co giãn được.
   *
   * Vì sao phải giãn ở ĐÂY chứ không phải bằng CSS (`width: max(100%, ...)`):
   * offset của cột ghim (`--col-*-start/end`) cộng dồn từ chính các giá trị
   * size này. Nếu để trình duyệt tự chia phần dư (hành vi mặc định của
   * `table-layout: fixed`), width thật của cột sẽ khác con số trong biến CSS →
   * các cột ghim lệch khỏi vị trí sticky. Giãn tại nguồn thì mọi thứ vẫn nhất
   * quán vì cùng đọc một bộ số.
   */
  availableWidth?: number;
}

/** Số vòng phân bổ tối đa — mỗi vòng loại bớt các cột vừa chạm `maxSize`. */
const MAX_STRETCH_PASSES = 4;
/** Dưới ngưỡng này coi như đã lấp đầy; tránh lặp vì sai số dấu phẩy động. */
const STRETCH_EPSILON_PX = 0.5;

/**
 * Chia phần dư cho các cột co giãn được, theo tỉ lệ độ rộng hiện tại.
 *
 * Chia theo tỉ lệ (không chia đều) để cột vốn rộng vẫn rộng hơn — chia đều sẽ
 * làm cột "Giới tính" 80px phình ngang bằng cột "Email" 220px.
 *
 * Cần nhiều vòng vì cột chạm `maxSize` phải nhả phần thừa lại cho các cột
 * khác; mỗi vòng thu hẹp dần tập cột còn nhận được.
 */
function stretchToFill(
  sizes: Map<string, number>,
  growable: Column<never>[],
  surplus: number,
): void {
  let remaining = surplus;
  let pool = growable;

  for (
    let pass = 0;
    pass < MAX_STRETCH_PASSES &&
    remaining > STRETCH_EPSILON_PX &&
    pool.length > 0;
    pass++
  ) {
    const poolTotal = pool.reduce(
      (sum, column) => sum + (sizes.get(column.id) ?? 0),
      0,
    );
    if (poolTotal <= 0) break;

    const nextPool: Column<never>[] = [];
    let consumed = 0;

    for (const column of pool) {
      const current = sizes.get(column.id) ?? 0;
      const maxSize = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
      const target = Math.min(
        current + (remaining * current) / poolTotal,
        maxSize,
      );

      consumed += target - current;
      sizes.set(column.id, target);
      if (target < maxSize) nextPool.push(column);
    }

    remaining -= consumed;
    pool = nextPool;
  }
}

export function computeColumnSizeVars<TData extends RowData>(
  table: Table<TData>,
  options: ComputeColumnSizeVarsOptions = {},
): ColumnSizeVars {
  const { overrides, availableWidth } = options;
  const leafColumns = table.getVisibleLeafColumns();

  const sizes = new Map<string, number>();
  let totalSize = 0;
  for (const column of leafColumns) {
    const size = overrides?.[column.id] ?? column.getSize();
    sizes.set(column.id, size);
    totalSize += size;
  }

  if (availableWidth && availableWidth > totalSize + STRETCH_EPSILON_PX) {
    // Cột hiển thị (ô chọn, thao tác…) có kích thước cố định theo thiết kế —
    // giãn chúng ra chỉ tạo khoảng trắng thừa quanh checkbox/nút.
    const growable = leafColumns.filter(
      (column) =>
        !getIsDisplayColumn(column.id) && overrides?.[column.id] === undefined,
    ) as unknown as Column<never>[];

    stretchToFill(sizes, growable, availableWidth - totalSize);

    totalSize = 0;
    for (const size of sizes.values()) totalSize += size;
  }

  const sizeOf = (columnId: string) => sizes.get(columnId) ?? 0;

  const vars: ColumnSizeVars = {};
  for (const column of leafColumns) {
    vars[`--col-${column.id}-size`] = sizeOf(column.id);
  }
  vars["--table-total-size"] = totalSize;

  for (const header of table.getFlatHeaders()) {
    const leaves = header.column.getLeafColumns();
    vars[`--header-${header.id}-size`] =
      leaves.length > 1
        ? leaves.reduce((sum, leaf) => sum + sizeOf(leaf.id), 0)
        : sizeOf(header.column.id);
  }

  // Ghim trái cộng dồn từ mép trái; ghim phải cộng dồn ngược từ mép phải.
  let startOffset = 0;
  for (const column of leafColumns) {
    if (column.getIsPinned() !== "left") continue;
    vars[`--col-${column.id}-start`] = startOffset;
    startOffset += sizeOf(column.id);
  }

  let endOffset = 0;
  for (let index = leafColumns.length - 1; index >= 0; index--) {
    const column = leafColumns[index];
    if (!column || column.getIsPinned() !== "right") continue;
    vars[`--col-${column.id}-end`] = endOffset;
    endOffset += sizeOf(column.id);
  }

  return vars;
}

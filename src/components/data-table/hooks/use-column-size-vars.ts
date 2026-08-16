"use client";

import type { RowData, Table } from "@tanstack/react-table";
import * as React from "react";

import { computeColumnSizeVars } from "../lib/column-size-vars";

/**
 * Biến CSS cho hình học cột — kỹ thuật TanStack Table khuyến nghị để resize
 * mượt, data-grid đã dùng sẵn.
 *
 * Vấn đề nếu không có: mỗi lần `columnSizing` đổi thì `table` (từ
 * `useReactTable`) đổi reference → mọi component đọc `table` re-render. Nếu
 * từng ô tự gọi `column.getSize()` rồi gán `style.width` bằng số, React phải
 * patch DOM ở TỪNG ô (20 hàng × 21 cột ≈ 420 lần) mỗi khung hình khi kéo.
 *
 * Gom tất cả vào MỘT object gán MỘT LẦN lên container; mỗi ô chỉ tham chiếu
 * `calc(var(--col-x-size) * 1px)` — chuỗi cố định không đổi qua các lần
 * render, nên trình duyệt tự cascade giá trị mới mà React không phải ghi lại
 * DOM của ô nào.
 *
 * Đây là đường React "bình thường" (ẩn/hiện cột, ghim, đổi thứ tự, chốt kích
 * thước sau khi kéo xong). Riêng lúc đang kéo, `useColumnResize` ghi thẳng
 * cùng bộ biến này vào DOM để không tốn lượt render nào.
 */
export function useColumnSizeVars<TData extends RowData>(
  table: Table<TData>,
): React.CSSProperties {
  const state = table.getState();

  // biome-ignore lint/correctness/useExhaustiveDependencies: `table` luôn đổi reference sau mỗi state update nên cố tình không đưa vào deps; chỉ 5 slice dưới đây mới thật sự làm hình học cột thay đổi.
  return React.useMemo(
    () => computeColumnSizeVars(table) as React.CSSProperties,
    [
      state.columnSizing,
      state.columnSizingInfo,
      state.columnVisibility,
      state.columnPinning,
      state.columnOrder,
    ],
  );
}

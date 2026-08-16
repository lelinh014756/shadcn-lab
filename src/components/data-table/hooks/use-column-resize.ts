"use client";

/**
 * Cử chỉ kéo resize cột — thay hoàn toàn `header.getResizeHandler()`.
 *
 * Vì sao không dùng handler của TanStack: với `columnResizeMode: "onChange"`,
 * mỗi `mousemove` nó bắn HAI lần cập nhật state (`setColumnSizingInfo` +
 * `setColumnSizing`). Chuột bắn 100-200 sự kiện/giây trong khi màn hình chỉ vẽ
 * 60 khung/giây, nên phần lớn số lần cập nhật đó không bao giờ kịp hiển thị —
 * chỉ tốn công. Nặng hơn nữa: ở màn Employees `columnSizing` là controlled
 * state chảy ngược lên store cấu hình bảng, nên MỖI sự kiện chuột kéo theo
 * `JSON.stringify` + `localStorage.setItem` đồng bộ và một lượt re-render cả
 * màn hình (toolbar, ô tìm kiếm, panel chi tiết...). Đó là nguồn giật thật sự.
 *
 * Cách làm ở đây, mượn đúng nguyên tắc của data-grid rồi đẩy thêm một bước:
 *
 *   mousedown  → 1 lần setState (đánh dấu cột đang resize, để tô sáng tay kéo)
 *   mousemove  → 0 lần setState. Gộp theo khung hình rồi ghi THẲNG biến CSS
 *                vào `style` của container. Trình duyệt tự cascade độ rộng
 *                xuống mọi ô; React đứng ngoài hoàn toàn.
 *   mouseup    → 1 lần setState (chốt kích thước, lúc này mới ghi localStorage)
 *
 * Tổng cộng 2 lượt render cho cả cử chỉ, thay vì ~200 như trước.
 */

import type { Header, RowData, Table } from "@tanstack/react-table";
import * as React from "react";

import {
  type ColumnSizeVars,
  computeColumnSizeVars,
} from "../lib/column-size-vars";

const CONTAINER_SELECTOR = '[data-slot="data-table-container"]';

function getClientX(event: MouseEvent | TouchEvent): number {
  return "touches" in event ? (event.touches[0]?.clientX ?? 0) : event.clientX;
}

export type ColumnResizeStarter<TData extends RowData> = (
  header: Header<TData, unknown>,
  event: React.MouseEvent | React.TouchEvent,
) => void;

export function useColumnResize<TData extends RowData>(
  table: Table<TData>,
): ColumnResizeStarter<TData> {
  return React.useCallback(
    (header, startEvent) => {
      const column = header.column;
      if (!column.getCanResize()) return;

      const container = (
        startEvent.currentTarget as HTMLElement
      ).closest<HTMLElement>(CONTAINER_SELECTOR);
      if (!container) return;

      const defaultColumnDef = table._getDefaultColumnDef();
      const startSize = column.getSize();
      const startX = getClientX(
        startEvent.nativeEvent as MouseEvent | TouchEvent,
      );
      const minSize = column.columnDef.minSize ?? defaultColumnDef.minSize ?? 0;
      const maxSize =
        column.columnDef.maxSize ??
        defaultColumnDef.maxSize ??
        Number.MAX_SAFE_INTEGER;

      // Cột ghim phải neo vào mép phải bảng: cạnh phải không nhúc nhích được
      // nên tay kéo nằm ở cạnh TRÁI, và kéo sang trái mới là phình to.
      const direction = column.getIsPinned() === "right" ? -1 : 1;

      table.setColumnSizingInfo((old) => ({
        ...old,
        isResizingColumn: column.id,
      }));

      let rafId: number | null = null;
      let currentSize = startSize;
      let painted: ColumnSizeVars = {};

      function paint() {
        rafId = null;
        const next = computeColumnSizeVars(table, { [column.id]: currentSize });
        for (const [key, value] of Object.entries(next)) {
          // Chỉ ghi biến thật sự đổi — kéo một cột thường chỉ động tới vài
          // biến, không cần đụng cả bảng mỗi khung hình.
          if (painted[key] === value) continue;
          container?.style.setProperty(key, String(value));
        }
        painted = next;
      }

      function onMove(event: MouseEvent | TouchEvent) {
        const delta = (getClientX(event) - startX) * direction;
        currentSize = Math.min(maxSize, Math.max(minSize, startSize + delta));
        rafId ??= requestAnimationFrame(paint);
      }

      function onEnd() {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onEnd);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onEnd);

        // Cố ý KHÔNG xoá biến đã ghi tay: lượt render sau của React sẽ ghi đè
        // đúng những giá trị này. Xoá trước sẽ để lộ một khung hình về kích
        // thước cũ trước khi React kịp commit.
        table.setColumnSizing((old) => ({ ...old, [column.id]: currentSize }));
        table.setColumnSizingInfo((old) => ({
          ...old,
          isResizingColumn: false,
        }));
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchmove", onMove, { passive: true });
      document.addEventListener("touchend", onEnd);
    },
    [table],
  );
}

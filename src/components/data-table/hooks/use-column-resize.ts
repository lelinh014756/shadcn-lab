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
/** Vùng thật sự cuộn (div bọc `<table>` trong `ui/table.tsx`). */
const SCROLLER_SELECTOR = '[data-slot="table-container"]';
const HEAD_LABEL_SELECTOR = '[data-slot="table-head-label"]';
const HEAD_MENU_TRIGGER_SELECTOR = '[data-slot="table-head-menu-trigger"]';

function getClientX(event: MouseEvent | TouchEvent): number {
  return "touches" in event ? (event.touches[0]?.clientX ?? 0) : event.clientX;
}

/**
 * Bề rộng tối thiểu để header của cột không bị cắt chữ: padding hai bên + chữ
 * đầy đủ + khoảng cách + icon mũi tên mở dropdown.
 *
 * ĐO THẲNG TRÊN DOM thay vì ước lượng theo số ký tự (kiểu `label.length * 8.5`)
 * — cách ước lượng sai khá xa với tiếng Việt có dấu, và sai khác nhau ở từng
 * mức density vì cỡ chữ/padding đổi theo. Đo một lần lúc `mousedown` nên không
 * ảnh hưởng gì tới độ mượt khi kéo.
 *
 * Bề rộng chữ đo bằng `Range` chứ KHÔNG phải `label.scrollWidth`: `scrollWidth`
 * trả số nguyên đã làm tròn, còn flex thì chia lại theo sub-pixel — chênh lệch
 * làm tròn giữa hai bên đủ để chữ vẫn bị cắt mất 1-2px ngay tại ngưỡng min.
 * `Range` cho bề rộng chữ ĐẦY ĐỦ, chính xác tới phần thập phân, kể cả khi span
 * đang bị `truncate` cắt.
 */
function measureHeaderMinWidth(headerCell: Element | null): number {
  const label = headerCell?.querySelector<HTMLElement>(HEAD_LABEL_SELECTOR);
  if (!label) return 0;

  // Padding nằm trên trigger (nó phủ trọn `<th>` bằng `absolute inset-0`), còn
  // header không có menu thì padding nằm trên chính `<th>`.
  const box =
    headerCell?.querySelector<HTMLElement>(HEAD_MENU_TRIGGER_SELECTOR) ??
    (headerCell as HTMLElement | null);
  if (!box) return 0;

  const style = getComputedStyle(box);
  const paddingX =
    Number.parseFloat(style.paddingLeft) +
    Number.parseFloat(style.paddingRight);
  const gap = Number.parseFloat(style.columnGap) || 0;

  let iconWidth = 0;
  for (const icon of box.querySelectorAll<SVGElement>(":scope > svg")) {
    iconWidth += icon.getBoundingClientRect().width;
  }

  const range = document.createRange();
  range.selectNodeContents(label);
  const textWidth = range.getBoundingClientRect().width || label.scrollWidth;

  return Math.ceil(
    paddingX + textWidth + (iconWidth > 0 ? gap + iconWidth : 0),
  );
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
      // Chặn ở mức lớn hơn giữa `minSize` khai báo và bề rộng header thật —
      // `minSize` khai báo tay dễ đặt hụt (hoặc bỏ trống, rơi về mặc định 20px
      // của TanStack) khiến kéo được tới mức nuốt mất tiêu đề cột.
      const declaredMinSize =
        column.columnDef.minSize ?? defaultColumnDef.minSize ?? 0;
      const minSize = Math.max(
        declaredMinSize,
        measureHeaderMinWidth(
          (startEvent.currentTarget as HTMLElement).closest("th"),
        ),
      );
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

      // Đo một lần lúc bắt đầu kéo: các cột co giãn phải tiếp tục lấp đầy khung
      // trong suốt cử chỉ, nếu không thu nhỏ một cột sẽ để lộ khoảng trắng bên
      // phải cho tới khi thả chuột. Cột đang kéo tự động bị loại khỏi việc giãn
      // (nó nằm trong `overrides`).
      const availableWidth =
        container.querySelector<HTMLElement>(SCROLLER_SELECTOR)?.clientWidth ??
        0;

      let rafId: number | null = null;
      let currentSize = startSize;
      let painted: ColumnSizeVars = {};

      function paint() {
        rafId = null;
        const next = computeColumnSizeVars(table, {
          overrides: { [column.id]: currentSize },
          availableWidth,
        });
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

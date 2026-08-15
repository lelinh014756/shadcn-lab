"use client";

/**
 * Tay kéo resize cột, port từ data-grid.
 *
 * Memo theo trạng thái resize và kích thước hiện tại: kéo một cột thì chỉ cột
 * đó re-render, các cột còn lại đứng yên.
 */

import type { Header, RowData, Table } from "@tanstack/react-table";
import * as React from "react";

import { cn } from "@/lib/utils";

interface DataTableColumnResizerProps<TData extends RowData> {
  header: Header<TData, unknown>;
  table: Table<TData>;
  label: string;
}

function getClientX(event: MouseEvent | TouchEvent): number {
  return "touches" in event ? (event.touches[0]?.clientX ?? 0) : event.clientX;
}

/**
 * Cột ghim phải neo vào mép phải bảng — cạnh phải của nó không di chuyển
 * được, nên phải resize bằng cách kéo cạnh TRÁI, và kéo trái (đi vào giữa
 * bảng) mới là "phình to" — ngược chiều so với cột thường/ghim trái.
 *
 * `header.getResizeHandler()` của TanStack chỉ đảo chiều ở cấp toàn bảng
 * (`columnResizeDirection`), không theo từng cột, nên phải tự viết handler
 * riêng cho đúng một cột này thay vì dùng handler mặc định.
 */
function useInvertedResizeHandler<TData extends RowData>(
  header: Header<TData, unknown>,
  table: Table<TData>,
) {
  return React.useCallback(
    (startEvent: React.MouseEvent | React.TouchEvent) => {
      const column = header.column;
      if (!column.getCanResize()) return;

      const defaultColumnDef = table._getDefaultColumnDef();
      const startSize = header.getSize();
      const startX = getClientX(
        startEvent.nativeEvent as MouseEvent | TouchEvent,
      );
      const minSize = column.columnDef.minSize ?? defaultColumnDef.minSize ?? 0;
      const maxSize =
        column.columnDef.maxSize ??
        defaultColumnDef.maxSize ??
        Number.MAX_SAFE_INTEGER;

      table.setColumnSizingInfo((old) => ({
        ...old,
        isResizingColumn: column.id,
      }));

      function onMove(event: MouseEvent | TouchEvent) {
        const delta = startX - getClientX(event);
        const nextSize = Math.min(
          maxSize,
          Math.max(minSize, startSize + delta),
        );
        table.setColumnSizing((old) => ({ ...old, [column.id]: nextSize }));
      }

      function onEnd() {
        table.setColumnSizingInfo((old) => ({
          ...old,
          isResizingColumn: false,
        }));
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onEnd);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onEnd);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchmove", onMove, { passive: true });
      document.addEventListener("touchend", onEnd);
    },
    [header, table],
  );
}

function DataTableColumnResizerImpl<TData extends RowData>({
  header,
  table,
  label,
}: DataTableColumnResizerProps<TData>) {
  const defaultColumnDef = table._getDefaultColumnDef();
  const isPinnedRight = header.column.getIsPinned() === "right";

  const invertedResizeHandler = useInvertedResizeHandler(header, table);
  const nativeResizeHandler = header.getResizeHandler();
  const onResizeStart = isPinnedRight
    ? invertedResizeHandler
    : nativeResizeHandler;

  const onDoubleClick = React.useCallback(() => {
    header.column.resetSize();
  }, [header.column]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Đổi độ rộng cột ${label}`}
      aria-valuenow={header.column.getSize()}
      aria-valuemin={defaultColumnDef.minSize}
      aria-valuemax={defaultColumnDef.maxSize}
      tabIndex={0}
      className={cn(
        // z-[1]: phải THẤP HƠN z-index của cột ghim (2 bên trái / 3 bên
        // phải, xem getColumnPinningStyle) — nếu không, khi cột này cuộn vào
        // vùng bị cột ghim che, tay kéo (và cả vùng hit-area rộng 18px của
        // nó) vẫn nổi lên trên, vẫn hover/kéo được dù đang ẩn phía sau.
        "absolute top-0 z-[1] h-full w-0.5 cursor-ew-resize touch-none select-none bg-border transition-opacity after:absolute after:inset-y-0 after:start-1/2 after:h-full after:w-[18px] after:-translate-x-1/2 after:content-[''] hover:bg-primary focus:bg-primary focus:outline-none",
        // Cột ghim phải: tay kéo nằm ở cạnh TRÁI (ranh giới với phần cuộn
        // được) — cạnh phải đã cố định vào mép bảng nên kéo ở đó vô nghĩa.
        isPinnedRight ? "-start-px" : "-end-px",
        header.column.getIsResizing()
          ? "bg-primary"
          : "opacity-0 hover:opacity-100",
      )}
      onDoubleClick={onDoubleClick}
      onMouseDown={onResizeStart}
      onTouchStart={onResizeStart}
    />
  );
}

export const DataTableColumnResizer = React.memo(
  DataTableColumnResizerImpl,
  (prev, next) =>
    prev.header.column.getIsResizing() === next.header.column.getIsResizing() &&
    prev.header.column.getSize() === next.header.column.getSize() &&
    prev.label === next.label,
) as typeof DataTableColumnResizerImpl;

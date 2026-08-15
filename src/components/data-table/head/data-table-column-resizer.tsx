"use client";

/**
 * Tay kéo resize cột.
 *
 * Cử chỉ kéo do `useColumnResize` lo trọn gói (xem chú thích ở đó): trong lúc
 * kéo không có lượt render React nào, độ rộng chảy qua biến CSS ghi thẳng vào
 * DOM. Handler mặc định `header.getResizeHandler()` không dùng nữa — nó commit
 * state ở mọi sự kiện chuột và không đảo chiều được theo từng cột.
 *
 * Memo theo trạng thái resize và kích thước hiện tại: kéo một cột thì chỉ cột
 * đó re-render, các cột còn lại đứng yên.
 */

import type { Header, RowData, Table } from "@tanstack/react-table";
import * as React from "react";

import { useColumnResize } from "@/hooks/table/use-column-resize";
import { cn } from "@/lib/utils";

interface DataTableColumnResizerProps<TData extends RowData> {
  header: Header<TData, unknown>;
  table: Table<TData>;
  label: string;
}

function DataTableColumnResizerImpl<TData extends RowData>({
  header,
  table,
  label,
}: DataTableColumnResizerProps<TData>) {
  const defaultColumnDef = table._getDefaultColumnDef();
  const isPinnedRight = header.column.getIsPinned() === "right";

  const startResize = useColumnResize(table);
  const onResizeStart = React.useCallback(
    (event: React.MouseEvent | React.TouchEvent) => startResize(header, event),
    [startResize, header],
  );

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

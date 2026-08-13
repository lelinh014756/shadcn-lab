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

function DataTableColumnResizerImpl<TData extends RowData>({
  header,
  table,
  label,
}: DataTableColumnResizerProps<TData>) {
  const defaultColumnDef = table._getDefaultColumnDef();

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
        // z-20 đủ để nằm trên cell nhưng vẫn dưới dropdown menu của header.
        "absolute -end-px top-0 z-20 h-full w-0.5 cursor-ew-resize touch-none select-none bg-border transition-opacity after:absolute after:inset-y-0 after:start-1/2 after:h-full after:w-[18px] after:-translate-x-1/2 after:content-[''] hover:bg-primary focus:bg-primary focus:outline-none",
        header.column.getIsResizing()
          ? "bg-primary"
          : "opacity-0 hover:opacity-100",
      )}
      onDoubleClick={onDoubleClick}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
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

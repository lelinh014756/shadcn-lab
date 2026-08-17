"use client";

/**
 * The data table renderer — the analog of MRT's `MRT_TablePaper`.
 *
 * Takes exactly one required prop: the table instance. Toolbars, renderers,
 * localization and slot props are all read off `table.options`, so composing a
 * screen never means threading a dozen loose props through this component.
 *
 *   <DataTable table={table} />
 */

import type { RowData } from "@tanstack/react-table";
import type * as React from "react";

import { DataTableContainer } from "@/components/data-table/table/data-table-container";
import { DataTableBottomToolbar } from "@/components/data-table/toolbar/data-table-bottom-toolbar";
import { DataTableTopToolbar } from "@/components/data-table/toolbar/data-table-top-toolbar";
import { TableProvider } from "@/components/table/table-provider";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { cn } from "@/lib/utils";
import { resolveSlotProp } from "@/types/table";

interface DataTableProps<TData extends RowData>
  extends React.ComponentProps<"div"> {
  table: TableCoreInstance<TData>;
  /**
   * Thay hẳn top toolbar mặc định, render ngay trong khung của bảng (nên bật
   * toàn màn hình vẫn thấy).
   *
   * Ưu tiên dùng cái này thay cho `options.renderTopToolbar` khi toolbar cần
   * đọc chính `table` (vd `<TableFullscreenToggle table={table} />`):
   * `renderTopToolbar` nằm trong options, mà options thì phải dựng TRƯỚC khi
   * có `table` — vòng phụ thuộc đó buộc nơi gọi phải lách qua `useRef`, và
   * cái ref ấy rất dễ giữ closure cũ. Ở đây thì `table` đã tồn tại sẵn lúc
   * render `<DataTable>`, nên truyền thẳng JSX là xong, không vòng vo.
   */
  topToolbar?: React.ReactNode;
  /** Floating bulk-action bar, shown while rows are selected. */
  actionBar?: React.ReactNode;
}

export function DataTable<TData extends RowData>({
  table,
  topToolbar,
  actionBar,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  const { isFullScreen } = table.getState();
  const { enableTopToolbar, enableBottomToolbar, renderTopToolbar, slotProps } =
    table.options;

  const paperProps = resolveSlotProp(slotProps.paper, { table });

  return (
    <TableProvider table={table}>
      <div
        data-slot="data-table"
        {...paperProps}
        {...props}
        className={cn(
          "flex w-full flex-col",
          isFullScreen &&
            "fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-background p-4",
          paperProps?.className,
          className,
        )}
      >
        {enableTopToolbar &&
          (topToolbar ??
            renderTopToolbar?.({ table }) ?? (
              <DataTableTopToolbar table={table}>{children}</DataTableTopToolbar>
            ))}
        <DataTableContainer table={table} />
        {enableBottomToolbar && <DataTableBottomToolbar table={table} />}
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </TableProvider>
  );
}

"use client";

import type { RowData } from "@tanstack/react-table";
import * as React from "react";

import { DataTableBody } from "@/components/data-table/body/data-table-body";
import { DataTableFooter } from "@/components/data-table/footer/data-table-footer";
import { DataTableHead } from "@/components/data-table/head/data-table-head";
import { TableProgressBar } from "@/components/table/table-progress-bar";
import { Table } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { cn } from "@/lib/utils";
import { resolveSlotProp } from "@/types/table";
import { useColumnSizeVars } from "../hooks/use-column-size-vars";
import { useInfiniteScroll } from "../hooks/use-infinite-scroll";

interface DataTableContainerProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

/** Scroll box that owns sticky positioning — the analog of MRT_TableContainer. */
export function DataTableContainer<TData extends RowData>({
  table,
}: DataTableContainerProps<TData>) {
  const { showProgressBars } = table.getState();
  const containerProps = resolveSlotProp(table.options.slotProps.container, {
    table,
  });

  // Ghim cột tính `left`/`right` từ `column.getSize()`, nên chỉ khớp khi trình
  // duyệt dùng đúng width đó — tức phải `table-layout: fixed` + width tổng.
  //
  // Chỉ bật khi thật cần: fixed layout ép mọi cột về size khai báo (mặc định
  // 150px), làm mất tỉ lệ tự nhiên. Ghim đúng một cột ở mép thì offset luôn
  // bằng 0 nên không cần; từ cột thứ hai trở đi offset mới cộng dồn.
  const pinning = table.getState().columnPinning;
  const hasExplicitSizing =
    table.options.enableColumnResizing === true ||
    (pinning.left?.length ?? 0) > 1 ||
    (pinning.right?.length ?? 0) > 1;

  const containerRef = React.useRef<HTMLDivElement>(null);

  // `table-layout: fixed` khoá bảng ở đúng tổng size khai báo, nên khi tổng đó
  // hụt so với khung (màn rộng, ẩn bớt cột, bật toàn màn hình) sẽ lòi ra mảng
  // trắng bên phải. Đo khung để `computeColumnSizeVars` giãn cột cho vừa.
  // Chỉ đo khi đang ở chế độ fixed — layout tự nhiên vốn đã `w-full`.
  const [availableWidth, setAvailableWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!hasExplicitSizing) {
      setAvailableWidth(0);
      return;
    }

    const scroller = containerRef.current?.querySelector<HTMLElement>(
      '[data-slot="table-container"]',
    );
    if (!scroller) return;

    const observer = new ResizeObserver(([entry]) => {
      // `contentRect` đã trừ thanh cuộn dọc — dùng `offsetWidth` sẽ giãn dư ra
      // đúng bằng bề rộng thanh cuộn và sinh thêm cuộn ngang thừa.
      if (entry) setAvailableWidth(entry.contentRect.width);
    });
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [hasExplicitSizing]);

  // Gán MỘT LẦN lên container — mỗi cell tham chiếu qua calc(var(...)) nên
  // trình duyệt tự cascade width khi resize, không cần React patch từng cell.
  // Xem chú thích trong useColumnSizeVars để biết lý do.
  const columnSizeVars = useColumnSizeVars(table, availableWidth);
  useInfiniteScroll({
    containerRef,
    enabled: table.options.enableInfiniteScroll,
    hasNextPage: table.options.hasNextPage,
    isFetchingNextPage: table.options.isFetchingNextPage,
    onFetchMore: table.options.onFetchMore,
    threshold: table.options.infiniteScrollThreshold,
    rowCount: table.getRowModel().rows.length,
  });

  return (
    <div
      data-slot="data-table-container"
      ref={containerRef}
      {...containerProps}
      style={{ ...columnSizeVars, ...containerProps?.style }}
      className={cn(
        // `min-h-0 flex-1` makes this the scroll region inside the paper's flex
        // column; without it the container grows to content height and the page
        // scrolls instead, which breaks sticky headers and infinite scroll.
        "relative flex h-full min-h-0 flex-1 flex-col rounded-md border",
        containerProps?.className,
      )}
    >
      <TableProgressBar visible={showProgressBars} />
      <Table
        style={
          hasExplicitSizing
            ? {
                tableLayout: "fixed",
                width: "calc(var(--table-total-size) * 1px)",
              }
            : undefined
        }
      >
        <DataTableHead table={table} />
        <DataTableBody table={table} />
        <DataTableFooter table={table} />
      </Table>
    </div>
  );
}

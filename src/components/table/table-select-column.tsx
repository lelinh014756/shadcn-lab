"use client";

/**
 * Cột chọn dòng dùng chung cho cả data-table và data-grid.
 *
 * UX: bình thường hiện số thứ tự, hover hoặc khi dòng được chọn thì đổi thành
 * checkbox — nhờ vậy STT và ô chọn dùng chung một cột thay vì chiếm hai cột.
 * `readOnly` tắt hẳn checkbox, chỉ còn số thứ tự.
 */

import type {
  CellContext,
  ColumnDef,
  HeaderContext,
  Row,
  Table,
} from "@tanstack/react-table";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type HitboxSize = "default" | "sm" | "lg";

interface TableSelectHitboxProps {
  htmlFor: string;
  children: React.ReactNode;
  size?: HitboxSize;
  debug?: boolean;
}

function TableSelectHitbox({
  htmlFor,
  children,
  size,
  debug,
}: TableSelectHitboxProps) {
  return (
    <div
      // Chặn nổi bọt: nếu không, click vào checkbox cũng kích hoạt luôn
      // `onRowClick` gắn ở cấp <tr> (bảng master-detail) — người dùng phải
      // click 2 lần vì lần đầu bị "ăn" bởi thay đổi state của việc chọn dòng.
      onClick={(event) => event.stopPropagation()}
      className={cn(
        // `flex items-center justify-center`: số STT/checkbox canh giữa ô,
        // khớp với checkbox tổng ở header (`TableSelectHeader` cũng
        // `justify-center`) — trước đây không có, nên checkbox/số nằm lọt
        // thỏm sát mép trái trong khi checkbox tổng ở giữa, nhìn lệch hàng.
        "group relative -my-1.5 flex h-[calc(100%+0.75rem)] items-center justify-center py-1.5",
        size === "default" && "-ms-3 -me-2 ps-3 pe-2",
        size === "sm" && "-ms-3 -me-1.5 ps-3 pe-1.5",
        size === "lg" && "-mx-3 px-3",
      )}
    >
      {children}
      <label
        htmlFor={htmlFor}
        className={cn(
          "absolute inset-0 cursor-pointer",
          debug && "border border-red-500 border-dashed bg-red-500/20",
        )}
      />
    </div>
  );
}

interface TableSelectCheckboxProps
  extends Omit<React.ComponentProps<typeof Checkbox>, "id"> {
  rowNumber?: number;
  hitboxSize?: HitboxSize;
  debug?: boolean;
}

function TableSelectCheckbox({
  rowNumber,
  hitboxSize,
  debug,
  checked,
  className,
  ...props
}: TableSelectCheckboxProps) {
  const id = React.useId();

  if (rowNumber !== undefined) {
    return (
      <TableSelectHitbox htmlFor={id} size={hitboxSize} debug={debug}>
        <div
          aria-hidden="true"
          className={cn(
            // `inset-0` (không phải toạ độ cố định `start-3 top-1.5`): số phải
            // phủ trọn hitbox rồi tự canh giữa, để trùng khít vị trí checkbox
            // (canh giữa qua flex của TableSelectHitbox) — swap qua lại lúc
            // hover mới đúng chỗ, không nhảy vị trí.
            "pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground text-xs tabular-nums transition-opacity group-hover:opacity-0",
            checked && "opacity-0",
          )}
        >
          {rowNumber}
        </div>
        <Checkbox
          id={id}
          className={cn(
            "relative border-muted-foreground/60 transition-[shadow,border,opacity] hover:border-primary/60",
            "opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100",
            className,
          )}
          checked={checked}
          {...props}
        />
      </TableSelectHitbox>
    );
  }

  return (
    <TableSelectHitbox htmlFor={id} size={hitboxSize} debug={debug}>
      <Checkbox
        id={id}
        className={cn(
          "relative border-muted-foreground/60 transition-[shadow,border] hover:border-primary/60",
          className,
        )}
        checked={checked}
        {...props}
      />
    </TableSelectHitbox>
  );
}

interface TableSelectHeaderProps<TData>
  extends Pick<HeaderContext<TData, unknown>, "table"> {
  readOnly?: boolean;
}

/**
 * Checkbox "chọn tất cả" ở header.
 *
 * Không dùng `TableSelectHitbox` ở đây: trick đó tính `-my-1.5
 * h-[calc(100%+0.75rem)]` dựa trên cell flex của data-grid, còn `<th>` của
 * data-table là table-cell với chiều cao cố định theo density (vd `h-8`,
 * không `py-*`) — % height tính sai khiến checkbox tràn ra ngoài ô header,
 * đè lên dòng dữ liệu đầu tiên. Header luôn chỉ là 1 checkbox tĩnh (không có
 * hiệu ứng hover-thành-số như ô dữ liệu), nên chỉ cần căn giữa bằng flex.
 */
function TableSelectHeader<TData>({
  table,
  readOnly,
}: TableSelectHeaderProps<TData>) {
  const onCheckedChange = React.useCallback(
    (value: boolean) => table.toggleAllPageRowsSelected(value),
    [table],
  );

  if (readOnly) {
    return (
      <span className="flex items-center justify-center text-muted-foreground text-xs">
        #
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center">
      <Checkbox
        aria-label="Select all"
        // `border-input` mặc định quá nhạt, gần như tàng hình trên nền header
        // (đã tô màu) khi chưa tích. Đậm lên hẳn một bậc để vẫn thấy rõ ô.
        className="border-muted-foreground/60 hover:border-primary/60"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={onCheckedChange}
      />
    </span>
  );
}

type GetRowNumber<TData> = (row: Row<TData>, table: Table<TData>) => number;

/**
 * Mặc định: ưu tiên chỉ số ảo của data-grid, không có thì cộng offset trang —
 * data-table chạy `manualPagination` nên `row.index` chỉ tính trong trang.
 */
function defaultGetRowNumber<TData>(row: Row<TData>, table: Table<TData>) {
  const visualIndex = table.options.meta?.getVisualRowIndex?.(row.id);
  if (visualIndex !== undefined) return visualIndex;

  const { pageIndex, pageSize } = table.getState().pagination;
  const offset = table.options.manualPagination ? pageIndex * pageSize : 0;
  return offset + row.index + 1;
}

interface TableSelectCellProps<TData>
  extends Pick<CellContext<TData, unknown>, "row" | "table"> {
  hitboxSize?: HitboxSize;
  enableRowMarkers?: boolean;
  readOnly?: boolean;
  debug?: boolean;
  getRowNumber?: GetRowNumber<TData>;
}

function TableSelectCell<TData>({
  row,
  table,
  hitboxSize,
  enableRowMarkers,
  readOnly,
  debug,
  getRowNumber = defaultGetRowNumber,
}: TableSelectCellProps<TData>) {
  const meta = table.options.meta;
  const rowNumber = enableRowMarkers ? getRowNumber(row, table) : undefined;

  const onCheckedChange = React.useCallback(
    (value: boolean) => {
      if (meta?.onRowSelect) {
        meta.onRowSelect(row.id, value, false);
      } else {
        row.toggleSelected(value);
      }
    },
    [meta, row],
  );

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.shiftKey) {
        event.preventDefault();
        meta?.onRowSelect?.(row.id, !row.getIsSelected(), true);
      }
    },
    [meta, row],
  );

  if (readOnly) {
    return (
      <div className="flex items-center justify-center text-muted-foreground text-xs tabular-nums">
        {rowNumber ?? getRowNumber(row, table)}
      </div>
    );
  }

  return (
    <TableSelectCheckbox
      aria-label={rowNumber ? `Select row ${rowNumber}` : "Select row"}
      checked={row.getIsSelected()}
      onCheckedChange={onCheckedChange}
      onClick={onClick}
      rowNumber={rowNumber}
      hitboxSize={hitboxSize}
      debug={debug}
    />
  );
}

interface GetTableSelectColumnOptions<TData>
  extends Omit<Partial<ColumnDef<TData>>, "id" | "header" | "cell"> {
  id?: string;
  enableRowMarkers?: boolean;
  readOnly?: boolean;
  hitboxSize?: HitboxSize;
  debug?: boolean;
  getRowNumber?: GetRowNumber<TData>;
}

export function getTableSelectColumn<TData>({
  id = "select",
  size = 40,
  hitboxSize = "default",
  enableHiding = false,
  enableResizing = false,
  enableSorting = false,
  enableRowMarkers = false,
  readOnly = false,
  debug = false,
  getRowNumber,
  ...props
}: GetTableSelectColumnOptions<TData> = {}): ColumnDef<TData> {
  return {
    id,
    header: ({ table }) => (
      <TableSelectHeader table={table} readOnly={readOnly} />
    ),
    cell: ({ row, table }) => (
      <TableSelectCell
        row={row}
        table={table}
        enableRowMarkers={enableRowMarkers}
        readOnly={readOnly}
        hitboxSize={hitboxSize}
        debug={debug}
        getRowNumber={getRowNumber}
      />
    ),
    size,
    enableHiding,
    enableResizing,
    enableSorting,
    ...props,
  };
}

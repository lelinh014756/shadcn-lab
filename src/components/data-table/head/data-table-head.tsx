"use client";

import { flexRender, type Header, type RowData } from "@tanstack/react-table";

import { DataTableColumnResizer } from "@/components/data-table/head/data-table-column-resizer";
import { DataTableHeadMenu } from "@/components/data-table/head/data-table-head-menu";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { getColumnPinningStyle } from "@/lib/table/column-utils";
import { getAlignClass, getDensityHeadClass } from "@/lib/table/style-utils";
import { cn } from "@/lib/utils";
import { getIsDisplayColumn, resolveSlotProp } from "@/types/table";

interface DataTableHeadProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

/**
 * Header string thì bọc dropdown (sắp xếp / ghim / ẩn); header là function thì
 * để nguyên cho caller tự quyết — cùng quy tắc data-grid đang dùng.
 */
function getPlainLabel<TData extends RowData>(
  header: Header<TData, unknown>,
): string | null {
  if (getIsDisplayColumn(header.column.id)) return null;

  const raw = header.column.columnDef.header;
  if (typeof raw === "string") return raw;

  return typeof header.column.columnDef.meta?.label === "string"
    ? header.column.columnDef.meta.label
    : null;
}

export function DataTableHead<TData extends RowData>({
  table,
}: DataTableHeadProps<TData>) {
  const { density } = table.getState();
  const {
    enableColumnResizing,
    enableStickyHeader,
    enableColumnBorders,
    localization,
    slotProps,
  } = table.options;

  const headProps = resolveSlotProp(slotProps.head, { table });
  const headRowProps = resolveSlotProp(slotProps.headRow, { table });

  return (
    <TableHeader
      {...headProps}
      className={cn(
        enableStickyHeader && "sticky top-0 z-10",
        // Ba thứ dưới đây PHẢI đi cùng nhau khi đổi nền header:
        //   `bg-*`             nền nhìn thấy của <thead>
        //   `--head-pinned-bg` bản ĐẶC tương đương, cho ô ghim (ô ghim buộc nền
        //                      đặc để che nội dung cuộn, không ăn được màu alpha)
        //   `--head-border`    màu đường phân cách cột. `--border` mặc định chỉ
        //                      đủ tương phản trên nền trắng của body; trên nền
        //                      header đã tô màu nó gần trùng nền và mất hút, nên
        //                      phải đậm hơn hẳn (25% primary so với nền 10%).
        "bg-primary/10 backdrop-blur-3xl [--head-border:color-mix(in_oklch,var(--color-primary)_25%,var(--background))] [--head-pinned-bg:color-mix(in_oklch,var(--color-primary)_10%,var(--background))]",
        headProps?.className,
      )}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          {...headRowProps}
          className={cn("hover:bg-transparent", headRowProps?.className)}
        >
          {headerGroup.headers.map((header, index) => {
            const cellProps = resolveSlotProp(slotProps.headCell, {
              table,
              header,
            });
            const align = header.column.columnDef.meta?.align;
            const label = getPlainLabel(header);
            const isLast = index === headerGroup.headers.length - 1;

            return (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                {...cellProps}
                style={{
                  ...getColumnPinningStyle({
                    column: header.column,
                    withBorder: true,
                    // Đọc biến đặt trên <thead> ở trên. Fallback giữ đúng hành
                    // vi cũ nếu ai đó thay className của head mà quên khai biến.
                    background: "var(--head-pinned-bg, var(--muted))",
                    borderColor: "var(--head-border, var(--border))",
                  }),
                  // Qua CSS var — xem useColumnSizeVars. Dùng --header- (không
                  // phải --col-) vì header có thể colSpan nhiều cột.
                  width: `calc(var(--header-${header.id}-size) * 1px)`,
                  ...cellProps?.style,
                }}
                className={cn(
                  getDensityHeadClass(density),
                  align && getAlignClass(align),
                  // Cột ghim tự vẽ viền bằng box-shadow trong
                  // getColumnPinningStyle — border-e ở đây chỉ dành cho cột
                  // thường (nếu để cả hai, cột ghim kế tiếp sẽ đè mất border-e).
                  // Cùng dùng `--head-border` để hai kiểu vẽ ra đúng một màu.
                  enableColumnBorders &&
                    !isLast &&
                    !header.column.getIsPinned() &&
                    "border-e border-e-[var(--head-border,var(--border))]",
                  cellProps?.className,
                )}
              >
                {header.isPlaceholder ? null : label ? (
                  <DataTableHeadMenu
                    header={header}
                    table={table}
                    label={label}
                    localization={localization}
                    density={density}
                  />
                ) : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )
                )}
                {enableColumnResizing && header.column.getCanResize() && (
                  <DataTableColumnResizer
                    header={header}
                    table={table}
                    label={label ?? header.column.id}
                  />
                )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}

"use client";

/**
 * Dropdown trên ô header: sắp xếp, ghim trái/phải, ẩn cột.
 *
 * Port từ `data-grid-column-header.tsx` nhưng bỏ phần icon kiểu dữ liệu và
 * `meta.onColumnClick` — hai thứ đó chỉ data-grid dùng.
 */

import type {
  ColumnSort,
  Header,
  RowData,
  SortDirection,
  SortingState,
  Table,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeOffIcon,
  PinIcon,
  PinOffIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDensityHeadMenuInsetClass } from "@/lib/table/style-utils";
import { cn } from "@/lib/utils";
import type { Density, TableLocalization } from "@/types/table";

interface DataTableHeadMenuProps<TData extends RowData> {
  header: Header<TData, unknown>;
  table: Table<TData>;
  label: string;
  localization: TableLocalization;
  density: Density;
}

export function DataTableHeadMenu<TData extends RowData>({
  header,
  table,
  label,
  localization,
  density,
}: DataTableHeadMenuProps<TData>) {
  const column = header.column;
  const isResizing = table.getState().columnSizingInfo.isResizingColumn;

  const pinned = column.getIsPinned();
  const isPinnedLeft = pinned === "left";
  const isPinnedRight = pinned === "right";

  const onSortingChange = React.useCallback(
    (direction: SortDirection) => {
      table.setSorting((prev: SortingState) => {
        const index = prev.findIndex((sort) => sort.id === column.id);
        const next: ColumnSort = { id: column.id, desc: direction === "desc" };

        if (index < 0) return [...prev, next];

        const updated = [...prev];
        updated[index] = next;
        return updated;
      });
    },
    [column.id, table],
  );

  const onSortRemove = React.useCallback(() => {
    table.setSorting((prev: SortingState) =>
      prev.filter((sort) => sort.id !== column.id),
    );
  }, [column.id, table]);

  const canSort = column.getCanSort();
  const canPin = column.getCanPin();
  const canHide = column.getCanHide();

  if (!canSort && !canPin && !canHide) {
    return <span className="truncate">{label}</span>;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          // `absolute inset-0` phủ trọn <th> (vốn đã `position: relative` hoặc
          // `sticky` từ getColumnPinningStyle, đủ làm containing block) — xem
          // vì sao KHÔNG dùng flex+width:auto/100% ở chú thích
          // `getDensityHeadMenuInsetClass`.
          "absolute inset-0 flex items-center justify-between gap-1.5 text-left hover:bg-accent/40 focus:outline-none data-[state=open]:bg-accent/40 [&_svg]:size-3.5",
          getDensityHeadMenuInsetClass(density),
          // Đang kéo resize thì chặn click, tránh mở menu ngoài ý muốn.
          isResizing && "pointer-events-none",
        )}
      >
        <span className="truncate">{label}</span>
        <ChevronDownIcon className="shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={0} className="w-52">
        {canSort && (
          <>
            <DropdownMenuCheckboxItem
              className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              checked={column.getIsSorted() === "asc"}
              onSelect={() => onSortingChange("asc")}
            >
              <ChevronUpIcon />
              {localization.sortByColumnAsc}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              checked={column.getIsSorted() === "desc"}
              onSelect={() => onSortingChange("desc")}
            >
              <ChevronDownIcon />
              {localization.sortByColumnDesc}
            </DropdownMenuCheckboxItem>
            {column.getIsSorted() && (
              <DropdownMenuItem
                className="[&_svg]:text-muted-foreground"
                onSelect={onSortRemove}
              >
                <XIcon />
                {localization.clearSort}
              </DropdownMenuItem>
            )}
          </>
        )}

        {canPin && (
          <>
            {canSort && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="[&_svg]:text-muted-foreground"
              onSelect={() => column.pin(isPinnedLeft ? false : "left")}
            >
              {isPinnedLeft ? <PinOffIcon /> : <PinIcon />}
              {isPinnedLeft ? localization.unpin : localization.pinToLeft}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="[&_svg]:text-muted-foreground"
              onSelect={() => column.pin(isPinnedRight ? false : "right")}
            >
              {isPinnedRight ? <PinOffIcon /> : <PinIcon />}
              {isPinnedRight ? localization.unpin : localization.pinToRight}
            </DropdownMenuItem>
          </>
        )}

        {canHide && (
          <>
            {(canSort || canPin) && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="[&_svg]:text-muted-foreground"
              onSelect={() => column.toggleVisibility(false)}
            >
              <EyeOffIcon />
              {localization.hideColumn}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

/**
 * Thanh thao tác hàng loạt, hiện khi có dòng được chọn.
 *
 * Gói sẵn phần lặp lại ở mọi bảng: số dòng đã chọn, nút đóng và Export CSV.
 * Các item riêng của từng màn hình truyền qua `children`.
 */

import type { RowData } from "@tanstack/react-table";
import { Download, X } from "lucide-react";
import * as React from "react";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/components/ui/action-bar";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { exportTableToCSV } from "@/lib/export";
import { DISPLAY_COLUMN_ID_LIST } from "@/types/table";

interface DataTableActionBarProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
  /** Item riêng của màn hình, render trước nút Export. */
  children?: React.ReactNode;
  /** Tắt nếu màn hình tự lo việc xuất file. */
  enableExport?: boolean;
  exportFilename?: string;
  onOpenChange?: (open: boolean) => void;
}

export function DataTableActionBar<TData extends RowData>({
  table,
  children,
  enableExport = true,
  exportFilename,
  onOpenChange,
}: DataTableActionBarProps<TData>) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const { localization } = table.options;

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) table.toggleAllRowsSelected(false);
      onOpenChange?.(open);
    },
    [onOpenChange, table],
  );

  const onExport = React.useCallback(() => {
    exportTableToCSV(table, {
      filename: exportFilename,
      // Cột STT/chọn/thao tác không có dữ liệu để xuất.
      excludeColumns: DISPLAY_COLUMN_ID_LIST,
      onlySelected: true,
    });
  }, [exportFilename, table]);

  return (
    <ActionBar open={rows.length > 0} onOpenChange={handleOpenChange}>
      <ActionBarSelection>
        <span className="font-medium">{rows.length}</span>
        <span>{localization.rowsSelected}</span>
        <ActionBarSeparator />
        <ActionBarClose>
          <X />
        </ActionBarClose>
      </ActionBarSelection>
      <ActionBarSeparator />
      <ActionBarGroup>
        {children}
        {enableExport && (
          <ActionBarItem onClick={onExport}>
            <Download />
            {localization.export}
          </ActionBarItem>
        )}
      </ActionBarGroup>
    </ActionBar>
  );
}

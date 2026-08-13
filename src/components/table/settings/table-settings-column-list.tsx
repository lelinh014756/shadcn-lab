"use client";

import { RotateCcw } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Sortable, SortableContent } from "@/components/ui/sortable";

import { TableSettingsColumnRow } from "./table-settings-column-row";
import type {
  BaseTableSettings,
  TableColumnLayoutOption,
  TableSettingsLabels,
} from "./table-settings-types";

interface TableSettingsColumnListProps {
  columns: TableColumnLayoutOption[];
  settings: BaseTableSettings;
  labels: TableSettingsLabels;
  onChange: (patch: Partial<BaseTableSettings>) => void;
  onReset: () => void;
  hasCustomLayout: boolean;
}

export function TableSettingsColumnList({
  columns,
  settings,
  labels,
  onChange,
  onReset,
  hasCustomLayout,
}: TableSettingsColumnListProps) {
  const columnsById = React.useMemo(
    () => new Map(columns.map((column) => [column.id, column])),
    [columns],
  );

  // Render in the user's order, ignoring ids that no longer exist.
  const orderedColumns = React.useMemo(
    () =>
      settings.columnOrder
        .map((id) => columnsById.get(id))
        .filter((column): column is TableColumnLayoutOption => !!column),
    [columnsById, settings.columnOrder],
  );

  const onOrderChange = React.useCallback(
    (next: TableColumnLayoutOption[]) => {
      onChange({ columnOrder: next.map((column) => column.id) });
    },
    [onChange],
  );

  const onPinChange = React.useCallback(
    (columnId: string, pinned: "left" | "right" | false) => {
      const pinLeftColumns = settings.pinLeftColumns.filter(
        (id) => id !== columnId,
      );
      const pinRightColumns = settings.pinRightColumns.filter(
        (id) => id !== columnId,
      );

      if (pinned === "left") pinLeftColumns.push(columnId);
      if (pinned === "right") pinRightColumns.push(columnId);

      onChange({ pinLeftColumns, pinRightColumns });
    },
    [onChange, settings.pinLeftColumns, settings.pinRightColumns],
  );

  const onVisibilityChange = React.useCallback(
    (columnId: string, visible: boolean) => {
      const hiddenColumnIds = visible
        ? settings.hiddenColumnIds.filter((id) => id !== columnId)
        : [...settings.hiddenColumnIds, columnId];
      onChange({ hiddenColumnIds });
    },
    [onChange, settings.hiddenColumnIds],
  );

  const onSizeChange = React.useCallback(
    (columnId: string, size: number) => {
      onChange({
        columnSizing: { ...settings.columnSizing, [columnId]: size },
      });
    },
    [onChange, settings.columnSizing],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm">{labels.columnLayout}</p>
        {hasCustomLayout && (
          <Button variant="ghost" className="h-7 text-xs" onClick={onReset}>
            <RotateCcw className="size-3.5" />
            {labels.resetColumnLayout}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-[1.5rem_auto_1fr_4.5rem_2rem_2rem_2rem] items-center gap-2 px-2 text-[11px] text-muted-foreground">
        <span>{labels.colOrder}</span>
        <span className="w-3.5" />
        <span>{labels.colName}</span>
        <span className="text-center">{labels.columnWidth}</span>
        <span
          className="-rotate-0 truncate text-center"
          title={labels.columnVisibility}
        >
          👁
        </span>
        <span className="text-center" title={labels.pinLeft}>
          ◀
        </span>
        <span className="text-center" title={labels.pinRight}>
          ▶
        </span>
      </div>

      <Sortable
        value={orderedColumns}
        onValueChange={onOrderChange}
        getItemValue={(column) => column.id}
        orientation="vertical"
      >
        <SortableContent asChild>
          <div className="flex flex-col gap-1">
            {orderedColumns.map((column, index) => (
              <TableSettingsColumnRow
                key={column.id}
                index={index}
                column={column}
                labels={labels}
                size={settings.columnSizing[column.id] ?? column.defaultSize}
                isVisible={!settings.hiddenColumnIds.includes(column.id)}
                pinned={
                  settings.pinLeftColumns.includes(column.id)
                    ? "left"
                    : settings.pinRightColumns.includes(column.id)
                      ? "right"
                      : false
                }
                onSizeChange={(size) => onSizeChange(column.id, size)}
                onVisibilityChange={(visible) =>
                  onVisibilityChange(column.id, visible)
                }
                onPinChange={(pinned) => onPinChange(column.id, pinned)}
              />
            ))}
          </div>
        </SortableContent>
      </Sortable>
    </div>
  );
}

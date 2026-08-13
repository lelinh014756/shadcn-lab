"use client";

import { GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SortableItem, SortableItemHandle } from "@/components/ui/sortable";
import { cn } from "@/lib/utils";

import type {
  TableColumnLayoutOption,
  TableSettingsLabels,
} from "./table-settings-types";

interface TableSettingsColumnRowProps {
  index: number;
  column: TableColumnLayoutOption;
  labels: TableSettingsLabels;
  size: number;
  isVisible: boolean;
  pinned: "left" | "right" | false;
  onSizeChange: (size: number) => void;
  onVisibilityChange: (visible: boolean) => void;
  onPinChange: (pinned: "left" | "right" | false) => void;
}

export function TableSettingsColumnRow({
  index,
  column,
  labels,
  size,
  isVisible,
  pinned,
  onSizeChange,
  onVisibilityChange,
  onPinChange,
}: TableSettingsColumnRowProps) {
  return (
    <SortableItem value={column.id} asChild>
      <div
        className={cn(
          "grid grid-cols-[1.5rem_auto_1fr_4.5rem_2rem_2rem_2rem] items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-xs",
          !isVisible && "opacity-60",
        )}
      >
        <span className="text-muted-foreground tabular-nums">{index + 1}</span>

        <SortableItemHandle asChild>
          <button
            type="button"
            aria-label={labels.dragColumn}
            className="cursor-grab text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-3.5" />
          </button>
        </SortableItemHandle>

        <span className="truncate font-medium">{column.label}</span>

        <Input
          type="number"
          aria-label={`${labels.columnWidth} — ${column.label}`}
          value={size}
          min={column.minSize}
          max={column.maxSize}
          step={4}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isNaN(next)) return;
            onSizeChange(
              Math.min(column.maxSize, Math.max(column.minSize, next)),
            );
          }}
          className="h-7 px-1.5 text-center text-xs"
        />

        <Checkbox
          aria-label={`${labels.columnVisibility} — ${column.label}`}
          checked={isVisible}
          onCheckedChange={(value) => onVisibilityChange(!!value)}
        />

        {/* Pin left / right are mutually exclusive. */}
        <Checkbox
          aria-label={`${labels.pinLeft} — ${column.label}`}
          checked={pinned === "left"}
          onCheckedChange={(value) => onPinChange(value ? "left" : false)}
        />
        <Checkbox
          aria-label={`${labels.pinRight} — ${column.label}`}
          checked={pinned === "right"}
          onCheckedChange={(value) => onPinChange(value ? "right" : false)}
        />
      </div>
    </SortableItem>
  );
}

"use client";

/**
 * Toolbar entry point for the settings sheet — trigger plus sheet, so a screen
 * mounts one component.
 */

import { SlidersHorizontal } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TableSettingsHandle } from "@/hooks/table/use-table-settings";

import { TableSettingsSheet } from "./table-settings-sheet";
import {
  type BaseTableSettings,
  defaultTableSettingsLabels,
  type TableColumnLayoutOption,
  type TableSettingsLabels,
} from "./table-settings-types";

interface TableSettingsProps<TSettings extends BaseTableSettings> {
  settings: TableSettingsHandle<TSettings>;
  columns: TableColumnLayoutOption[];
  defaults: () => TSettings;
  labels?: Partial<TableSettingsLabels>;
  disabled?: boolean;
  showInfiniteScrollSwitch?: boolean;
  onBeforeApply?: (draft: TSettings, applied: TSettings) => void;
}

export function TableSettings<TSettings extends BaseTableSettings>({
  settings,
  columns,
  defaults,
  labels: labelOverrides,
  disabled,
  showInfiniteScrollSwitch,
  onBeforeApply,
}: TableSettingsProps<TSettings>) {
  const [open, setOpen] = React.useState(false);

  const labels = React.useMemo(
    () => ({ ...defaultTableSettingsLabels, ...labelOverrides }),
    [labelOverrides],
  );

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={labels.trigger}
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            <SlidersHorizontal className="text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{labels.trigger}</TooltipContent>
      </Tooltip>

      <TableSettingsSheet
        open={open}
        onOpenChange={setOpen}
        settings={settings}
        columns={columns}
        labels={labels}
        defaults={defaults}
        showInfiniteScrollSwitch={showInfiniteScrollSwitch}
        onBeforeApply={onBeforeApply}
      />
    </>
  );
}

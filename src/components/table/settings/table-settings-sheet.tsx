"use client";

import * as React from "react";
import { AppSheet } from "@/components/feedback/app-sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { TableSettingsHandle } from "@/hooks/table/use-table-settings";
import { cn } from "@/lib/utils";

import { TableSettingsColumnList } from "./table-settings-column-list";
import type {
  BaseTableSettings,
  TableColumnLayoutOption,
  TableSettingsLabels,
} from "./table-settings-types";

interface TableSettingsSheetProps<TSettings extends BaseTableSettings> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: TableSettingsHandle<TSettings>;
  columns: TableColumnLayoutOption[];
  labels: TableSettingsLabels;
  defaults: () => TSettings;
  /** Show the infinite-scroll switch only where the screen supports both modes. */
  showInfiniteScrollSwitch?: boolean;
  onBeforeApply?: (draft: TSettings, applied: TSettings) => void;
}

export function TableSettingsSheet<TSettings extends BaseTableSettings>({
  open,
  onOpenChange,
  settings,
  columns,
  labels,
  defaults,
  showInfiniteScrollSwitch = false,
  onBeforeApply,
}: TableSettingsSheetProps<TSettings>) {
  const { draft, patchDraft } = settings;

  const hasCustomLayout = React.useMemo(() => {
    const base = defaults();
    return (
      draft.columnOrder.join("|") !== base.columnOrder.join("|") ||
      draft.hiddenColumnIds.join("|") !== base.hiddenColumnIds.join("|") ||
      draft.pinLeftColumns.join("|") !== base.pinLeftColumns.join("|") ||
      draft.pinRightColumns.join("|") !== base.pinRightColumns.join("|") ||
      columns.some(
        (column) =>
          (draft.columnSizing[column.id] ?? column.defaultSize) !==
          (base.columnSizing[column.id] ?? column.defaultSize),
      )
    );
  }, [columns, defaults, draft]);

  const onResetLayout = React.useCallback(() => {
    const base = defaults();
    patchDraft({
      columnOrder: [...base.columnOrder],
      hiddenColumnIds: [...base.hiddenColumnIds],
      pinLeftColumns: [...base.pinLeftColumns],
      pinRightColumns: [...base.pinRightColumns],
      columnSizing: { ...base.columnSizing },
    } as Partial<TSettings>);
  }, [defaults, patchDraft]);

  const onApply = React.useCallback(() => {
    settings.apply(onBeforeApply);
    onOpenChange(false);
  }, [onBeforeApply, onOpenChange, settings]);

  return (
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title={labels.title}
      description={labels.columnLayout}
      // `wide` của AppSheet là 42rem, rộng hơn 36rem mà sheet này vẫn dùng.
      // Ghim lại đúng bề rộng cũ để việc đổi sang AppSheet không kéo theo thay
      // đổi layout ngoài ý muốn. Cần cả biến thể `data-[side=right]:` vì
      // `ui/sheet` đặt sẵn selector đó, không đè thì nó thắng.
      variant="wide"
      className="sm:max-w-xl data-[side=right]:sm:max-w-xl"
      bodyClassName="flex flex-col gap-5 p-4"
      footer={
        <>
          <Button variant="outline" onClick={settings.clear}>
            {labels.clear}
          </Button>
          <Button onClick={onApply}>{labels.apply}</Button>
        </>
      }
    >
      <section className="flex flex-col gap-2">
        <p className="font-medium text-sm">{labels.behavior}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <SettingsSwitchRow
            label={labels.multiRowSelection}
            checked={draft.showMultiRowSelection}
            onCheckedChange={(checked) =>
              patchDraft({
                showMultiRowSelection: checked,
              } as Partial<TSettings>)
            }
          />
          <SettingsSwitchRow
            label={labels.summaryFooter}
            checked={draft.showSummaryFooter}
            onCheckedChange={(checked) =>
              patchDraft({
                showSummaryFooter: checked,
              } as Partial<TSettings>)
            }
          />
          {showInfiniteScrollSwitch && (
            <SettingsSwitchRow
              label={labels.infiniteScroll}
              checked={draft.enableInfiniteScroll}
              onCheckedChange={(checked) =>
                patchDraft({
                  enableInfiniteScroll: checked,
                } as Partial<TSettings>)
              }
            />
          )}
        </div>
      </section>

      <TableSettingsColumnList
        columns={columns}
        settings={draft}
        labels={labels}
        onChange={(patch) => patchDraft(patch as Partial<TSettings>)}
        onReset={onResetLayout}
        hasCustomLayout={hasCustomLayout}
      />
    </AppSheet>
  );
}

interface SettingsSwitchRowProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * Label left, control right. A 3-column grid keeps labels from wrapping while
 * staying flexible about how many switches a screen declares.
 */
function SettingsSwitchRow({
  label,
  checked,
  onCheckedChange,
}: SettingsSwitchRowProps) {
  const id = React.useId();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-md border px-2.5 py-2",
        checked && "border-primary/40 bg-primary/5",
      )}
    >
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="size-4 accent-primary"
      />
    </div>
  );
}

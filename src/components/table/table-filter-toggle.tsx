"use client";

import type { RowData } from "@tanstack/react-table";
import { FilterX, ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";

interface TableFilterToggleProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

export function TableFilterToggle<TData extends RowData>({
  table,
}: TableFilterToggleProps<TData>) {
  const { showColumnFilters } = table.getState();
  const { localization } = table.options;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={localization.showHideFilters}
          aria-pressed={showColumnFilters}
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => table.extra.setShowColumnFilters(!showColumnFilters)}
        >
          {showColumnFilters ? (
            <FilterX className="text-muted-foreground" />
          ) : (
            <ListFilter className="text-muted-foreground" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{localization.showHideFilters}</TooltipContent>
    </Tooltip>
  );
}

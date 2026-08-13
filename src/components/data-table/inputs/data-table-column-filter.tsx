"use client";

/**
 * Renders the filter control a column asks for via `meta.variant`.
 *
 * Extracted from the old `data-table-toolbar.tsx` so the same dispatch can be
 * mounted either in the toolbar (current default) or in a filter row beneath
 * the header, the way MRT positions column filters.
 */

import type { Column } from "@tanstack/react-table";
import * as React from "react";

import { DataTableDateFilter } from "@/components/data-table/inputs/data-table-date-filter";
import { DataTableFacetedFilter } from "@/components/data-table/inputs/data-table-faceted-filter";
import { DataTableSliderFilter } from "@/components/data-table/inputs/data-table-slider-filter";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableColumnFilterProps<TData> {
  column: Column<TData>;
}

export function DataTableColumnFilter<TData>({
  column,
}: DataTableColumnFilterProps<TData>) {
  const columnMeta = column.columnDef.meta;

  const onFilterRender = React.useCallback(() => {
    if (!columnMeta?.variant) return null;

    switch (columnMeta.variant) {
      case "text":
        return (
          <Input
            placeholder={columnMeta.placeholder ?? columnMeta.label}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className="h-8 w-40 lg:w-56"
          />
        );

      case "number":
        return (
          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className={cn("h-8 w-[120px]", columnMeta.unit && "pr-8")}
            />
            {columnMeta.unit && (
              <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                {columnMeta.unit}
              </span>
            )}
          </div>
        );

      case "range":
        return (
          <DataTableSliderFilter
            column={column}
            title={columnMeta.label ?? column.id}
          />
        );

      case "date":
      case "dateRange":
        return (
          <DataTableDateFilter
            column={column}
            title={columnMeta.label ?? column.id}
            multiple={columnMeta.variant === "dateRange"}
          />
        );

      case "select":
      case "multiSelect":
        return (
          <DataTableFacetedFilter
            column={column}
            title={columnMeta.label ?? column.id}
            options={columnMeta.options ?? []}
            multiple={columnMeta.variant === "multiSelect"}
          />
        );

      default:
        return null;
    }
  }, [column, columnMeta]);

  return onFilterRender();
}

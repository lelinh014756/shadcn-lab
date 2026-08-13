"use client";

import type { RowData } from "@tanstack/react-table";
import { Rows2, Rows3, Rows4 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { getNextDensity } from "@/lib/table/style-utils";
import type { Density } from "@/types/table";

const densityIcons: Record<Density, typeof Rows2> = {
  compact: Rows4,
  comfortable: Rows3,
  spacious: Rows2,
};

interface TableDensityToggleProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

/**
 * A real toggle, unlike the Landsoft/MRT setup where `!important` cell padding
 * made the same affordance a no-op.
 */
export function TableDensityToggle<TData extends RowData>({
  table,
}: TableDensityToggleProps<TData>) {
  const { density } = table.getState();
  const { localization } = table.options;
  const Icon = densityIcons[density];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={localization.toggleDensity}
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => table.extra.setDensity(getNextDensity(density))}
        >
          <Icon className="text-muted-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{localization.toggleDensity}</TooltipContent>
    </Tooltip>
  );
}

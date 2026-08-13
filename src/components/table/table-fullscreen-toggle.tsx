"use client";

import type { RowData } from "@tanstack/react-table";
import { Maximize, Minimize } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";

interface TableFullscreenToggleProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
}

export function TableFullscreenToggle<TData extends RowData>({
  table,
}: TableFullscreenToggleProps<TData>) {
  const { isFullScreen } = table.getState();
  const { localization } = table.options;
  const { setIsFullScreen } = table.extra;

  // Fullscreen locks page scroll; Escape is the conventional way out.
  React.useEffect(() => {
    if (!isFullScreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFullScreen(false);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullScreen, setIsFullScreen]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={localization.toggleFullScreen}
          aria-pressed={isFullScreen}
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => setIsFullScreen(!isFullScreen)}
        >
          {isFullScreen ? (
            <Minimize className="text-muted-foreground" />
          ) : (
            <Maximize className="text-muted-foreground" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{localization.toggleFullScreen}</TooltipContent>
    </Tooltip>
  );
}

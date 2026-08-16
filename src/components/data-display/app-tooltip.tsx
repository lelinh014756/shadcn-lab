"use client";

/** AppTooltip — port từ Payment-DIP-web, rút gọn cụm Tooltip 3 tầng còn 1 thẻ. */

import type * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppTooltipProps {
  text: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function AppTooltip({
  text,
  children,
  side = "bottom",
}: AppTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{text}</TooltipContent>
    </Tooltip>
  );
}

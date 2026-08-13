"use client";

import type { RowData } from "@tanstack/react-table";
import { Search, X } from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TableCoreInstance } from "@/hooks/table/use-table-core";
import { cn } from "@/lib/utils";

interface TableGlobalFilterInputProps<TData extends RowData>
  extends Omit<React.ComponentProps<"div">, "children"> {
  table: TableCoreInstance<TData>;
  placeholder?: string;
}

export function TableGlobalFilterInput<TData extends RowData>({
  table,
  placeholder,
  className,
  ...props
}: TableGlobalFilterInputProps<TData>) {
  const { localization } = table.options;
  const value = (table.getState().globalFilter as string) ?? "";

  return (
    <div className={cn("relative", className)} {...props}>
      <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label={localization.search}
        placeholder={placeholder ?? localization.search}
        value={value}
        onChange={(event) => table.setGlobalFilter(event.target.value)}
        className="h-8 w-40 pl-8 lg:w-56"
      />
      {value && (
        <Button
          aria-label={localization.clearSearch}
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 size-6 -translate-y-1/2"
          onClick={() => table.setGlobalFilter("")}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

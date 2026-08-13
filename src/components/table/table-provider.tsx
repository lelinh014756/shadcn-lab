"use client";

/**
 * Makes the table instance ambient.
 *
 * Internal subcomponents still receive `table` as an explicit prop (MRT does the
 * same), but toolbar pieces a consumer composes themselves — a density toggle
 * dropped into a custom toolbar, say — can pull the instance from here instead
 * of threading it down by hand.
 */

import type { RowData } from "@tanstack/react-table";
import * as React from "react";

import type { TableCoreInstance } from "@/hooks/table/use-table-core";

// The instance is generic; the context erases it and consumers re-narrow.
// biome-ignore lint/suspicious/noExplicitAny: the context is generic-erased by design
const TableContext = React.createContext<TableCoreInstance<any> | null>(null);

interface TableProviderProps<TData extends RowData> {
  table: TableCoreInstance<TData>;
  children: React.ReactNode;
}

export function TableProvider<TData extends RowData>({
  table,
  children,
}: TableProviderProps<TData>) {
  return (
    <TableContext.Provider value={table}>{children}</TableContext.Provider>
  );
}

export function useTableContext<
  TData extends RowData,
>(): TableCoreInstance<TData> {
  const table = React.useContext(TableContext);

  if (!table) {
    throw new Error("useTableContext must be used within a <TableProvider>");
  }

  return table as TableCoreInstance<TData>;
}

/** Non-throwing variant for components that also accept an explicit `table`. */
export function useOptionalTableContext<
  TData extends RowData,
>(): TableCoreInstance<TData> | null {
  return React.useContext(TableContext) as TableCoreInstance<TData> | null;
}

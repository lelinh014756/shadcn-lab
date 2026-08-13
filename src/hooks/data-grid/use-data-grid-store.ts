"use client";

/**
 * The grid's external state store.
 *
 * Grid interactions (cell focus, range selection, editing, search) fire far too
 * often for `useState` — every mousemove during a drag would re-render the whole
 * table. A `useSyncExternalStore` store lets each cell subscribe to only the
 * slice it cares about, so a drag re-renders the cells that changed and nothing
 * else.
 */

import type {
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import * as React from "react";

import type {
  CellPosition,
  ContextMenuState,
  PasteDialogState,
  RowHeightValue,
  SelectionState,
} from "@/types/data-grid";

export interface DataGridState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  rowHeight: RowHeightValue;
  rowSelection: RowSelectionState;
  selectionState: SelectionState;
  focusedCell: CellPosition | null;
  editingCell: CellPosition | null;
  cutCells: Set<string>;
  contextMenu: ContextMenuState;
  searchQuery: string;
  searchMatches: CellPosition[];
  matchIndex: number;
  searchOpen: boolean;
  lastClickedRowId: string | null;
  pasteDialog: PasteDialogState;
}

export interface DataGridStore {
  subscribe: (callback: () => void) => () => void;
  getState: () => DataGridState;
  setState: <K extends keyof DataGridState>(
    key: K,
    value: DataGridState[K],
  ) => void;
  notify: () => void;
  /** Coalesce several `setState` calls into a single notification. */
  batch: (fn: () => void) => void;
}

export function useDataGridStore<T>(
  store: DataGridStore,
  selector: (state: DataGridState) => T,
): T {
  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

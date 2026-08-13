"use client";

/**
 * Owns the slice of table state that MRT adds on top of TanStack Table.
 *
 * Each key follows the same controlled/uncontrolled contract as TanStack: pass
 * it in `state` to control it, otherwise the hook holds it internally.
 */

import * as React from "react";

import type { TableExtraState } from "@/types/table";

const defaultExtraState: TableExtraState = {
  density: "comfortable",
  isFullScreen: false,
  showColumnFilters: false,
  showGlobalFilter: false,
  showAlertBanner: false,
  showSkeletons: false,
  showProgressBars: false,
  isLoading: false,
};

export interface UseTableExtraStateProps {
  initialState?: Partial<TableExtraState>;
  state?: Partial<TableExtraState>;
}

export interface TableExtraStateHandle extends TableExtraState {
  setDensity: (density: TableExtraState["density"]) => void;
  setIsFullScreen: (isFullScreen: boolean) => void;
  setShowColumnFilters: (showColumnFilters: boolean) => void;
  setShowGlobalFilter: (showGlobalFilter: boolean) => void;
  setShowAlertBanner: (showAlertBanner: boolean) => void;
}

export function useTableExtraState({
  initialState,
  state,
}: UseTableExtraStateProps): TableExtraStateHandle {
  const [internal, setInternal] = React.useState<TableExtraState>(() => ({
    ...defaultExtraState,
    ...initialState,
  }));

  // A key present in `state` is controlled by the caller and wins.
  const resolved = React.useMemo<TableExtraState>(
    () => ({ ...internal, ...state }),
    [internal, state],
  );

  const setKey = React.useCallback(
    <K extends keyof TableExtraState>(key: K, value: TableExtraState[K]) => {
      setInternal((prev) =>
        prev[key] === value ? prev : { ...prev, [key]: value },
      );
    },
    [],
  );

  return React.useMemo(
    () => ({
      ...resolved,
      setDensity: (density) => setKey("density", density),
      setIsFullScreen: (isFullScreen) => setKey("isFullScreen", isFullScreen),
      setShowColumnFilters: (showColumnFilters) =>
        setKey("showColumnFilters", showColumnFilters),
      setShowGlobalFilter: (showGlobalFilter) =>
        setKey("showGlobalFilter", showGlobalFilter),
      setShowAlertBanner: (showAlertBanner) =>
        setKey("showAlertBanner", showAlertBanner),
    }),
    [resolved, setKey],
  );
}

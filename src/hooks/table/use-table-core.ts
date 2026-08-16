"use client";

/**
 * Shared table core — the analog of MRT's `useMRT_TableOptions` +
 * `useMRT_TableInstance` + `useMRT_DisplayColumns`.
 *
 * The contract this establishes is the whole point of the refactor: **the table
 * instance is the only transport**. Renderers, slot props, localization and the
 * extra MRT-style state all ride on `table.options` / `table.getState()`, so a
 * renderer only ever needs `{ table }` — never a spread of loose props.
 *
 * Layering:
 *   useTableCore            ← this file: defaults, display columns, extra state
 *     ├─ useDataTable       ← adds URL state, pagination, advanced filters
 *     └─ useDataGrid        ← adds cell selection, editing, paste, virtualizer
 */

import {
  getCoreRowModel,
  type RowData,
  type TableState,
  type Table as TanstackTable,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { resolveLocalization } from "@/lib/table/localization";
import type {
  TableCoreOptions,
  TableCoreState,
  TableExtraState,
  TableLocalization,
  TableSlotProps,
} from "@/types/table";
import { useTableDisplayColumns } from "./use-table-display-columns";
import {
  type TableExtraStateHandle,
  useTableExtraState,
} from "./use-table-extra-state";

/**
 * The MRT-style additions layered on top of TanStack's resolved options.
 * Kept separate from `TableOptionsResolved` so the instance type below can
 * intersect the two and stay assignable to a plain `Table<TData>`.
 */
export interface DefinedTableCoreOptions<TData extends RowData>
  extends Omit<
    TableCoreOptions<TData>,
    "columns" | "data" | "state" | "initialState"
  > {
  localization: TableLocalization;
  slotProps: TableSlotProps<TData>;
  layoutMode: NonNullable<TableCoreOptions<TData>["layoutMode"]>;
  enableTopToolbar: boolean;
  enableBottomToolbar: boolean;
  enableToolbarInternalActions: boolean;
  enableDensityToggle: boolean;
  enableFullScreenToggle: boolean;
  enableColumnVisibilityToggle: boolean;
  enableColumnFilterToggle: boolean;
  enableTableSettings: boolean;
  enableStickyHeader: boolean;
  enableStickyFooter: boolean;
  enableColumnBorders: boolean;
  enablePagination: boolean;
  pageSizeOptions: number[];
  enableRowNumbers: boolean;
  enableRowActions: boolean;
  positionActionsColumn: "first" | "last";
  positionExpandColumn: "first" | "last";
  enableInfiniteScroll: boolean;
  infiniteScrollThreshold: number;
  idPrefix: string;
}

/**
 * The instance every renderer takes.
 *
 * `options` intersects TanStack's resolved options with ours, so the instance
 * remains a valid `Table<TData>` and can still be handed to any plain TanStack
 * helper. Only `getState` is replaced outright — an intersection there would
 * resolve to the narrower TanStack return type and hide the extra state.
 */
export type TableCoreInstance<TData extends RowData> = Omit<
  TanstackTable<TData>,
  "getState"
> & {
  options: TanstackTable<TData>["options"] & DefinedTableCoreOptions<TData>;
  getState: () => TableCoreState;
  /** Setters for the extra state, mirroring TanStack's `setX` naming. */
  extra: TableExtraStateHandle;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];
const DEFAULT_INFINITE_SCROLL_THRESHOLD_PX = 400;

let idCounter = 0;

export function useTableCore<TData extends RowData>(
  options: TableCoreOptions<TData>,
): TableCoreInstance<TData> {
  const {
    columns,
    state,
    initialState,
    localization: localizationOverrides,
    slotProps,
    layoutMode = "semantic",
    enableTopToolbar = true,
    enableBottomToolbar = true,
    enableToolbarInternalActions = true,
    enableDensityToggle = true,
    enableFullScreenToggle = true,
    enableColumnVisibilityToggle = true,
    enableColumnFilterToggle = true,
    enableTableSettings = false,
    enableStickyHeader = true,
    enableStickyFooter = false,
    enableColumnBorders = false,
    enablePagination = true,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    enableRowSelection,
    enableRowNumbers = false,
    enableRowActions = false,
    positionActionsColumn = "last",
    positionExpandColumn = "first",
    enableInfiniteScroll = false,
    infiniteScrollThreshold = DEFAULT_INFINITE_SCROLL_THRESHOLD_PX,
    hasNextPage,
    isFetchingNextPage,
    onFetchMore,
    activeRowId,
    onRowClick,
    isLoading,
    renderRowActions,
    renderDetailPanel,
    renderTopToolbar,
    renderTopToolbarCustomActions,
    renderBottomToolbarCustomActions,
    renderToolbarAlertBannerContent,
    renderEmptyRowsFallback,
    idPrefix: idPrefixProp,
    ...tableOptions
  } = options;

  // Stable per-instance prefix so two tables on one page keep distinct DOM ids.
  const idPrefix = React.useMemo(
    () => idPrefixProp ?? `dt-${++idCounter}`,
    [idPrefixProp],
  );

  const localization = React.useMemo(
    () => resolveLocalization(localizationOverrides),
    [localizationOverrides],
  );

  const extraStateInput = React.useMemo(() => pickExtraState(state), [state]);

  // `isLoading` là một cờ duy nhất caller truyền vào; hai state hiển thị suy ra
  // từ nó ở đây thay vì bắt mỗi màn hình tự nhớ quy tắc (xem chú thích
  // `isLoading` trong TableCoreOptions). Spread `extraStateInput` sau cùng để
  // state truyền tay vẫn thắng.
  const rowCount = (tableOptions.data as unknown[] | undefined)?.length ?? 0;
  const resolvedExtraState = React.useMemo(() => {
    if (isLoading === undefined) return extraStateInput;
    return {
      showProgressBars: isLoading,
      showSkeletons: isLoading && rowCount === 0,
      ...extraStateInput,
    };
  }, [isLoading, rowCount, extraStateInput]);

  const extra = useTableExtraState({
    initialState: pickExtraState(initialState),
    state: resolvedExtraState,
  });

  const allColumns = useTableDisplayColumns<TData>({
    columns,
    localization,
    enableRowSelection,
    enableRowNumbers,
    enableRowActions,
    positionActionsColumn,
    positionExpandColumn,
    renderRowActions,
    renderDetailPanel,
  });

  const table = useReactTable<TData>({
    getCoreRowModel: getCoreRowModel(),
    ...tableOptions,
    columns: allColumns,
    enableRowSelection,
    state: pickTanstackState(state),
    initialState: pickTanstackState(initialState),
  });

  // Attach the MRT-style surface so renderers can read everything off `table`.
  const instance = table as unknown as TableCoreInstance<TData>;

  instance.options = {
    ...table.options,
    localization,
    slotProps: slotProps ?? {},
    layoutMode,
    enableTopToolbar,
    // Cuộn vô hạn thì không còn khái niệm trang: tắt luôn pagination và bottom
    // toolbar để màn hình không phải nhớ tắt tay hai cái này mỗi lần bật.
    enableBottomToolbar: enableInfiniteScroll ? false : enableBottomToolbar,
    enableToolbarInternalActions,
    enableDensityToggle,
    enableFullScreenToggle,
    enableColumnVisibilityToggle,
    enableColumnFilterToggle,
    enableTableSettings,
    enableStickyHeader,
    enableStickyFooter,
    enableColumnBorders,
    enablePagination: enableInfiniteScroll ? false : enablePagination,
    pageSizeOptions,
    enableRowNumbers,
    enableRowActions,
    positionActionsColumn,
    positionExpandColumn,
    enableInfiniteScroll,
    infiniteScrollThreshold,
    hasNextPage,
    isFetchingNextPage,
    onFetchMore,
    activeRowId,
    onRowClick,
    isLoading,
    renderRowActions,
    renderDetailPanel,
    renderTopToolbar,
    renderTopToolbarCustomActions,
    renderBottomToolbarCustomActions,
    renderToolbarAlertBannerContent,
    renderEmptyRowsFallback,
    idPrefix,
  };

  const getTanstackState = table.getState;
  instance.getState = () =>
    ({ ...getTanstackState(), ...extractExtraState(extra) }) as TableCoreState;
  instance.extra = extra;

  return instance;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EXTRA_STATE_KEYS = [
  "density",
  "isFullScreen",
  "showColumnFilters",
  "showGlobalFilter",
  "showAlertBanner",
  "showSkeletons",
  "showProgressBars",
  "isLoading",
] as const satisfies readonly (keyof TableExtraState)[];

function pickExtraState(
  state: Partial<TableCoreState> | undefined,
): Partial<TableExtraState> | undefined {
  if (!state) return undefined;

  const picked: Partial<TableExtraState> = {};
  let found = false;
  for (const key of EXTRA_STATE_KEYS) {
    if (state[key] !== undefined) {
      // @ts-expect-error — key is a valid TableExtraState key by construction
      picked[key] = state[key];
      found = true;
    }
  }

  return found ? picked : undefined;
}

function pickTanstackState(
  state: Partial<TableCoreState> | undefined,
): Partial<TableState> | undefined {
  if (!state) return undefined;

  const rest = { ...state } as Record<string, unknown>;
  for (const key of EXTRA_STATE_KEYS) {
    delete rest[key];
  }

  return rest as Partial<TableState>;
}

function extractExtraState(extra: TableExtraStateHandle): TableExtraState {
  return {
    density: extra.density,
    isFullScreen: extra.isFullScreen,
    showColumnFilters: extra.showColumnFilters,
    showGlobalFilter: extra.showGlobalFilter,
    showAlertBanner: extra.showAlertBanner,
    showSkeletons: extra.showSkeletons,
    showProgressBars: extra.showProgressBars,
    isLoading: extra.isLoading,
  };
}

/**
 * Shared table core types.
 *
 * These mirror the Material React Table option surface — the parts MRT adds on
 * top of TanStack Table — so a screen written against MRT reads the same here.
 *
 * Three deliberate deviations from MRT:
 *   1. Column renderers stay lowercase (`cell` / `header` / `footer`). MRT
 *      capitalizes them only to avoid colliding with TanStack's own keys; we
 *      *are* TanStack, so there is nothing to collide with.
 *   2. `mui*Props` become `slotProps.*`. Same `object | (ctx) => object` shape,
 *      no MUI.
 *   3. `sx` tokens become Tailwind classes.
 */

import type {
  Cell,
  Column,
  ColumnDef,
  Header,
  Row,
  RowData,
  TableOptions,
  TableState,
  Table as TanstackTable,
} from "@tanstack/react-table";

// ─── Display columns ─────────────────────────────────────────────────────────

/**
 * Ids of the columns the core injects. Mirrors MRT's `mrt-row-*` namespace.
 *
 * These are a **public API**: user column layout preferences are persisted by
 * id, so renaming one silently invalidates stored settings.
 */
export const DISPLAY_COLUMN_IDS = {
  select: "dt-row-select",
  numbers: "dt-row-numbers",
  expand: "dt-row-expand",
  actions: "dt-row-actions",
} as const;

export type DisplayColumnId =
  (typeof DISPLAY_COLUMN_IDS)[keyof typeof DISPLAY_COLUMN_IDS];

export const DISPLAY_COLUMN_ID_LIST = Object.values(
  DISPLAY_COLUMN_IDS,
) as DisplayColumnId[];

export function getIsDisplayColumn(
  columnId: string,
): columnId is DisplayColumnId {
  return (DISPLAY_COLUMN_ID_LIST as string[]).includes(columnId);
}

// ─── Presentation ────────────────────────────────────────────────────────────

export type Density = "compact" | "comfortable" | "spacious";

/**
 * `semantic` renders real `<table>` markup (better a11y and printing).
 * `grid` renders CSS grid — required for virtualization, used by the data grid.
 */
export type LayoutMode = "semantic" | "grid";

export type ColumnAlign = "start" | "center" | "end";

// ─── Extra state ─────────────────────────────────────────────────────────────

/** State MRT owns that TanStack Table has no concept of. */
export interface TableExtraState {
  density: Density;
  isFullScreen: boolean;
  showColumnFilters: boolean;
  showGlobalFilter: boolean;
  showAlertBanner: boolean;
  showSkeletons: boolean;
  showProgressBars: boolean;
  isLoading: boolean;
}

export type TableCoreState = TableState & TableExtraState;

// ─── Slot props ──────────────────────────────────────────────────────────────

export type SlotProp<TContext, TProps> =
  | TProps
  | ((context: TContext) => TProps);

/**
 * Element-agnostic attribute bag. The two renderers mount slots on different
 * elements (semantic `<thead>` / `<td>` vs. CSS-grid `<div>`), so this stays
 * ref-free rather than pinning one element type.
 */
export type SlotElementProps = React.HTMLAttributes<HTMLElement>;

type TableContext<TData> = { table: TanstackTable<TData> };

export interface TableSlotProps<TData> {
  paper?: SlotProp<TableContext<TData>, SlotElementProps>;
  container?: SlotProp<TableContext<TData>, SlotElementProps>;
  topToolbar?: SlotProp<TableContext<TData>, SlotElementProps>;
  bottomToolbar?: SlotProp<TableContext<TData>, SlotElementProps>;
  head?: SlotProp<TableContext<TData>, SlotElementProps>;
  headRow?: SlotProp<TableContext<TData>, SlotElementProps>;
  headCell?: SlotProp<
    TableContext<TData> & { header: Header<TData, unknown> },
    SlotElementProps
  >;
  body?: SlotProp<TableContext<TData>, SlotElementProps>;
  bodyRow?: SlotProp<
    TableContext<TData> & { row: Row<TData> },
    SlotElementProps
  >;
  bodyCell?: SlotProp<
    TableContext<TData> & { cell: Cell<TData, unknown> },
    SlotElementProps
  >;
  footer?: SlotProp<TableContext<TData>, SlotElementProps>;
  footerRow?: SlotProp<TableContext<TData>, SlotElementProps>;
  footerCell?: SlotProp<
    TableContext<TData> & { header: Header<TData, unknown> },
    SlotElementProps
  >;
}

export function resolveSlotProp<TContext, TProps>(
  slot: SlotProp<TContext, TProps> | undefined,
  context: TContext,
): TProps | undefined {
  if (typeof slot === "function") {
    return (slot as (context: TContext) => TProps)(context);
  }
  return slot;
}

// ─── Localization ────────────────────────────────────────────────────────────

export interface TableLocalization {
  actions: string;
  and: string;
  cancel: string;
  clearFilter: string;
  clearFilters: string;
  clearSearch: string;
  clearSort: string;
  columnActions: string;
  density: string;
  densityCompact: string;
  densityComfortable: string;
  densitySpacious: string;
  edit: string;
  expand: string;
  expandAll: string;
  filterByColumn: string;
  goToFirstPage: string;
  goToLastPage: string;
  goToNextPage: string;
  goToPreviousPage: string;
  hideAll: string;
  hideColumn: string;
  noRecordsToDisplay: string;
  noResultsFound: string;
  of: string;
  or: string;
  page: string;
  pinToLeft: string;
  pinToRight: string;
  reset: string;
  resetColumnSize: string;
  resetOrder: string;
  rowActions: string;
  rowNumber: string;
  rowNumbers: string;
  rowsPerPage: string;
  rowsSelected: string;
  search: string;
  select: string;
  selectAll: string;
  settings: string;
  showAll: string;
  showHideColumns: string;
  showHideFilters: string;
  showHideSearch: string;
  sortByColumnAsc: string;
  sortByColumnDesc: string;
  toggleDensity: string;
  toggleFullScreen: string;
  toggleSelectAll: string;
  toggleSelectRow: string;
  unpin: string;
  unpinAll: string;
}

// ─── Core options ────────────────────────────────────────────────────────────

export interface TableCoreOptions<TData extends RowData>
  extends Omit<TableOptions<TData>, "getCoreRowModel" | "state"> {
  /** Partial override of both TanStack state and the extra MRT-style state. */
  state?: Partial<TableCoreState>;
  initialState?: Partial<TableCoreState>;

  // Display columns
  enableRowSelection?: TableOptions<TData>["enableRowSelection"];
  enableRowNumbers?: boolean;
  enableRowActions?: boolean;
  positionActionsColumn?: "first" | "last";
  renderRowActions?: (context: {
    row: Row<TData>;
    table: TanstackTable<TData>;
  }) => React.ReactNode;

  // Detail panel
  renderDetailPanel?: (context: {
    row: Row<TData>;
    table: TanstackTable<TData>;
  }) => React.ReactNode;
  positionExpandColumn?: "first" | "last";

  // Pagination
  enablePagination?: boolean;
  pageSizeOptions?: number[];

  // Toolbars
  enableTopToolbar?: boolean;
  enableBottomToolbar?: boolean;
  enableToolbarInternalActions?: boolean;
  enableDensityToggle?: boolean;
  enableFullScreenToggle?: boolean;
  enableColumnVisibilityToggle?: boolean;
  enableColumnFilterToggle?: boolean;
  enableTableSettings?: boolean;
  renderTopToolbarCustomActions?: (context: {
    table: TanstackTable<TData>;
  }) => React.ReactNode;
  renderBottomToolbarCustomActions?: (context: {
    table: TanstackTable<TData>;
  }) => React.ReactNode;
  renderToolbarAlertBannerContent?: (context: {
    table: TanstackTable<TData>;
  }) => React.ReactNode;

  // Presentation
  layoutMode?: LayoutMode;
  enableStickyHeader?: boolean;
  enableStickyFooter?: boolean;
  renderEmptyRowsFallback?: (context: {
    table: TanstackTable<TData>;
  }) => React.ReactNode;

  /** Prefixes generated DOM ids so two tables on one page stay a11y-correct. */
  idPrefix?: string;

  localization?: Partial<TableLocalization>;
  slotProps?: TableSlotProps<TData>;
}

export type DataTableInstance<TData extends RowData> = TanstackTable<TData>;

export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown,
> = ColumnDef<TData, TValue>;

export type DataTableColumn<TData extends RowData> = Column<TData, unknown>;

// ─── Column meta extensions ──────────────────────────────────────────────────

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Horizontal alignment for head, body and footer cells. */
    align?: ColumnAlign;
    /** Absorb leftover horizontal space, mirroring MRT's `grow`. */
    grow?: boolean;
  }
}

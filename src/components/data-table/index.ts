/**
 * DataTable — component tự chứa, copy nguyên thư mục `data-table/` này sang
 * project khác là chạy được, miễn có đủ các dependency dùng chung liệt kê bên
 * dưới (không nằm trong thư mục này vì chúng phục vụ cả `data-grid` và các
 * phần khác của hệ thống, không riêng gì data-table).
 *
 * ─── Bắt buộc copy kèm ────────────────────────────────────────────────────
 *
 * 1) `src/components/ui/*`
 *    Toàn bộ shadcn primitives: button, input, table, sheet, tooltip,
 *    dropdown-menu, checkbox, select, popover, command, calendar, badge,
 *    separator, skeleton, sortable, label, textarea, action-bar, spinner...
 *    `pnpm dlx shadcn add` từng cái nếu project đích chưa có.
 *
 * 2) `src/components/table/*`
 *    Lớp "chrome" dùng chung cho MỌI renderer bảng (data-table lẫn
 *    data-grid) — density toggle, fullscreen toggle, cột hiển thị/ẩn, ô chọn
 *    dòng, sheet cấu hình bảng, sheet bộ lọc... `getTableSelectColumn` và
 *    `TableColumnVisibilityMenu` trong đây ĐANG được data-grid dùng thật,
 *    phần còn lại được thiết kế để dùng chung dù hiện chỉ data-table gọi tới.
 *
 * 3) `src/components/feedback/app-sheet.tsx`,
 *    `src/components/general/{app-button,app-icon}.tsx`,
 *    `src/components/data-display/app-tooltip.tsx`
 *    Bộ UI kit chung cấp hệ thống (không liên quan riêng bảng) — sheet/nút/
 *    icon/tooltip bọc thêm behavior so với `ui/` gốc. `table/table-filters.tsx`
 *    và `table/settings/table-settings-sheet.tsx` dùng `AppSheet`.
 *
 * 4) `src/hooks/table/{use-table-core,use-table-display-columns,
 *    use-table-extra-state,use-table-settings,use-table-prefs}.ts(x)`
 *    Nền tảng `TableCoreInstance` — nơi options/state hai renderer đều dựa
 *    vào (`useDataTable` ở đây gọi thẳng `useTableCore`). Đặt tên/vị trí
 *    (`hooks/table/`, không phải `hooks/data-table/`) đã nói rõ ý định dùng
 *    chung, dù hiện tại `useDataGrid` chưa nối vào (tự triển khai song song).
 *
 * 5) `src/lib/table/{column-utils,style-utils}.ts`,
 *    `src/lib/table/localization/{en,vi,index}.ts`
 *    Style/token/label dùng chung: `getColumnPinningStyle` (khác với bản
 *    `lib/data-table.ts` bên trong thư mục này — bản đó chỉ data-table dùng),
 *    class padding/density, `TableLocalization`.
 *
 * 6) `src/types/table.ts`
 *    `TableCoreOptions`, `TableCoreState`, `TableSlotProps`, `SlotProp`,
 *    `DISPLAY_COLUMN_IDS`... — type nền cho cả hai renderer.
 *
 * 7) `src/hooks/use-debounced-callback.ts`, `src/lib/id.ts`
 *    Hai tiện ích nhỏ dùng chung thật (data-grid cũng import trực tiếp).
 *
 * 8) `src/lib/utils.ts` (hàm `cn`)
 *
 * ─── KHÔNG cần copy (đã nằm sẵn trong thư mục này) ─────────────────────────
 *
 * `use-data-table.ts`, `use-column-resize.ts`, `use-column-size-vars.ts`
 * (hooks/), `data-table.ts`, `export.ts`, `parsers.ts`, `column-size-vars.ts`
 * (lib/), `types.ts`, `config.ts` — toàn bộ phần chỉ data-table dùng (URL
 * pagination/sort/filter, resize qua CSS var, xuất CSV, schema filter nâng
 * cao). Đã xác nhận qua grep: không file nào trong nhóm này được data-grid
 * hay bất kỳ chỗ nào khác import.
 */

// Primitive của action bar, re-export để nơi dùng tự lắp ghép item riêng.
export {
  ActionBarGroup,
  ActionBarItem,
  ActionBarSeparator,
} from "@/components/ui/action-bar";
export { DataTableBody } from "./body/data-table-body";
export { DataTableDetailPanel } from "./body/data-table-detail-panel";
export { dataTableConfig, type DataTableConfig } from "./config";
export { DataTable } from "./data-table";
export { DataTableSkeleton } from "./data-table-skeleton";
export { DataTableFooter } from "./footer/data-table-footer";
export { DataTableColumnHeader } from "./head/data-table-column-header";
export { DataTableHead } from "./head/data-table-head";
export {
  type ColumnResizeStarter,
  useColumnResize,
} from "./hooks/use-column-resize";
export { useColumnSizeVars } from "./hooks/use-column-size-vars";
export { useDataTable } from "./hooks/use-data-table";
export { DataTableColumnFilter } from "./inputs/data-table-column-filter";
export { DataTableDateFilter } from "./inputs/data-table-date-filter";
export { DataTableFacetedFilter } from "./inputs/data-table-faceted-filter";
export { DataTableRangeFilter } from "./inputs/data-table-range-filter";
export { DataTableSliderFilter } from "./inputs/data-table-slider-filter";
export {
  type ColumnSizeVars,
  computeColumnSizeVars,
} from "./lib/column-size-vars";
export {
  getColumnPinningStyle,
  getDefaultFilterOperator,
  getFilterOperators,
  getValidFilters,
} from "./lib/data-table";
export { exportTableToCSV } from "./lib/export";
export { getFiltersStateParser, getSortingStateParser } from "./lib/parsers";
export { DataTableFilterList } from "./menus/data-table-filter-list";
export { DataTableFilterMenu } from "./menus/data-table-filter-menu";
export { DataTableSortList } from "./menus/data-table-sort-list";
export { DataTableContainer } from "./table/data-table-container";
export { DataTableActionBar } from "./toolbar/data-table-action-bar";
export { DataTableBottomToolbar } from "./toolbar/data-table-bottom-toolbar";
export { DataTablePagination } from "./toolbar/data-table-pagination";
export { DataTableTopToolbar } from "./toolbar/data-table-top-toolbar";
export type {
  DataTableRowAction,
  ExtendedColumnFilter,
  ExtendedColumnSort,
  FilterOperator,
  FilterVariant,
  JoinOperator,
  Option,
  QueryKeys,
} from "./types";

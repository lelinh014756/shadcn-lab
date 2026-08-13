/**
 * Shape of the user-facing table settings sheet.
 *
 * A feature module declares its own settings type extending
 * `BaseTableSettings`, plus builders that translate it into TanStack state
 * (`columnOrder`, `columnVisibility`, `columnSizing`, `columnPinning`) — the
 * same split the reference MRT module uses.
 */

export interface BaseTableSettings {
  showMultiRowSelection: boolean;
  showSummaryFooter: boolean;
  enableInfiniteScroll: boolean;
  pinLeftColumns: string[];
  pinRightColumns: string[];
  hiddenColumnIds: string[];
  columnOrder: string[];
  columnSizing: Record<string, number>;
}

export interface TableColumnLayoutOption {
  id: string;
  label: string;
  defaultSize: number;
  minSize: number;
  maxSize: number;
}

export interface TableSettingsLabels {
  title: string;
  trigger: string;
  behavior: string;
  multiRowSelection: string;
  summaryFooter: string;
  infiniteScroll: string;
  columnLayout: string;
  colOrder: string;
  colName: string;
  columnWidth: string;
  columnVisibility: string;
  pinLeft: string;
  pinRight: string;
  locked: string;
  dragColumn: string;
  resetColumnLayout: string;
  apply: string;
  clear: string;
}

export const defaultTableSettingsLabels: TableSettingsLabels = {
  title: "Cấu hình bảng",
  trigger: "Cấu hình bảng",
  behavior: "Hành vi",
  multiRowSelection: "Chọn nhiều dòng",
  summaryFooter: "Dòng tổng hợp",
  infiniteScroll: "Cuộn vô hạn",
  columnLayout: "Bố cục cột",
  colOrder: "STT",
  colName: "Tên cột",
  columnWidth: "Độ rộng",
  columnVisibility: "Hiện",
  pinLeft: "Ghim trái",
  pinRight: "Ghim phải",
  locked: "Cột cố định",
  dragColumn: "Kéo để đổi thứ tự",
  resetColumnLayout: "Đặt lại bố cục",
  apply: "Áp dụng",
  clear: "Xoá cấu hình",
};

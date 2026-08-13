import type {
  AdminTableColumnLayoutOption,
  AdminTableSettingsLabels,
} from "@/components/data-display/admin-table-settings";
import type { Dictionary } from "@/lib/i18n/types";

export const EMPLOYEES_DATA_COLUMN_ORDER = [
  "code",
  "fullName",
  "emails",
  "gender",
  "dateOfBirth",
  "positionName",
  "managerName",
  "departmentName",
  "phones",
  "jobTitle",
  "organizationName",
  "startDate",
  "idInfo",
  "bankInfo",
  "staffStatusId",
  "isActive",
  "created",
  "updated",
  "notes",
] as const;

export type EmployeesDataColumnId = (typeof EMPLOYEES_DATA_COLUMN_ORDER)[number];

export const DEFAULT_EMPLOYEES_COLUMN_SIZING: Record<EmployeesDataColumnId, number> = {
  code: 90,
  fullName: 200,
  emails: 220,
  gender: 80,
  dateOfBirth: 110,
  positionName: 120,
  managerName: 140,
  departmentName: 160,
  phones: 150,
  jobTitle: 150,
  organizationName: 140,
  startDate: 110,
  idInfo: 200,
  bankInfo: 200,
  staffStatusId: 130,
  isActive: 160,
  created: 170,
  updated: 170,
  notes: 180,
};

export const DEFAULT_EMPLOYEES_PIN_LEFT: string[] = ["code", "fullName"];

/** Hidden by default — mở full 18 cột theo yêu cầu user. */
export const DEFAULT_EMPLOYEES_HIDDEN: string[] = [];

export type EmployeesTableSettings = {
  showMultiRowSelection: boolean;
  showSummaryFooter: boolean;
  enableInfiniteScroll: boolean;
  pinLeftColumns: string[];
  pinRightColumns: string[];
  hiddenColumnIds: string[];
  columnOrder: string[];
  columnSizing: Record<string, number>;
};

export function defaultEmployeesTableSettings(): EmployeesTableSettings {
  return {
    showMultiRowSelection: false,
    showSummaryFooter: false,
    enableInfiniteScroll: true,
    pinLeftColumns: [...DEFAULT_EMPLOYEES_PIN_LEFT],
    pinRightColumns: [],
    hiddenColumnIds: [...DEFAULT_EMPLOYEES_HIDDEN],
    columnOrder: [...EMPLOYEES_DATA_COLUMN_ORDER],
    columnSizing: { ...DEFAULT_EMPLOYEES_COLUMN_SIZING },
  };
}

export function cloneEmployeesTableSettings(settings: EmployeesTableSettings): EmployeesTableSettings {
  return {
    ...settings,
    pinLeftColumns: [...settings.pinLeftColumns],
    pinRightColumns: [...settings.pinRightColumns],
    hiddenColumnIds: [...settings.hiddenColumnIds],
    columnOrder: [...settings.columnOrder],
    columnSizing: { ...settings.columnSizing },
  };
}

export function buildEmployeesColumnVisibility(
  settings: EmployeesTableSettings,
): Record<string, boolean> {
  return Object.fromEntries(settings.hiddenColumnIds.map((id) => [id, false]));
}

/** Strip MRT display-column ids from persisted sizing (only data columns belong in prefs). */
export function filterEmployeesDataColumnSizing(
  sizing: Record<string, number>,
): Record<string, number> {
  const valid = new Set<string>(EMPLOYEES_DATA_COLUMN_ORDER);
  return Object.fromEntries(Object.entries(sizing).filter(([id]) => valid.has(id)));
}

export function buildEmployeesActionColumnSize(): number {
  return 120;
}

/** Controlled MRT sizing — data columns from prefs + fixed width for pinned actions. */
export function buildEmployeesMrtColumnSizing(
  settings: EmployeesTableSettings,
): Record<string, number> {
  return {
    ...filterEmployeesDataColumnSizing(settings.columnSizing),
    "mrt-row-actions": buildEmployeesActionColumnSize(),
  };
}

export function reconcileEmployeesTableSettings(stored: EmployeesTableSettings): EmployeesTableSettings {
  const valid = new Set<string>(EMPLOYEES_DATA_COLUMN_ORDER);
  const filterIds = (ids: string[]) => ids.filter((id) => valid.has(id));
  const orderFiltered = filterIds(stored.columnOrder);
  const orderKnown = new Set(orderFiltered);
  const appended = EMPLOYEES_DATA_COLUMN_ORDER.filter((id) => !orderKnown.has(id));
  return {
    ...stored,
    enableInfiniteScroll: stored.enableInfiniteScroll ?? true,
    hiddenColumnIds: filterIds(stored.hiddenColumnIds),
    pinLeftColumns: filterIds(stored.pinLeftColumns),
    pinRightColumns: filterIds(stored.pinRightColumns),
    columnOrder: [...orderFiltered, ...appended],
    columnSizing: Object.fromEntries(
      Object.entries(stored.columnSizing).filter(([id]) => valid.has(id)),
    ),
  };
}

export function employeesTableSettingsEqual(
  a: EmployeesTableSettings,
  b: EmployeesTableSettings,
): boolean {
  return (
    a.showMultiRowSelection === b.showMultiRowSelection &&
    a.showSummaryFooter === b.showSummaryFooter &&
    a.enableInfiniteScroll === b.enableInfiniteScroll &&
    a.pinLeftColumns.join("|") === b.pinLeftColumns.join("|") &&
    a.pinRightColumns.join("|") === b.pinRightColumns.join("|") &&
    a.hiddenColumnIds.join("|") === b.hiddenColumnIds.join("|") &&
    a.columnOrder.join("|") === b.columnOrder.join("|") &&
    EMPLOYEES_DATA_COLUMN_ORDER.every(
      (id) =>
        (a.columnSizing[id] ?? DEFAULT_EMPLOYEES_COLUMN_SIZING[id]) ===
        (b.columnSizing[id] ?? DEFAULT_EMPLOYEES_COLUMN_SIZING[id]),
    )
  );
}

export function countNonDefaultEmployeesTableSettings(settings: EmployeesTableSettings): number {
  const defaults = defaultEmployeesTableSettings();
  let count = 0;
  if (settings.showMultiRowSelection !== defaults.showMultiRowSelection) count += 1;
  if (settings.showSummaryFooter !== defaults.showSummaryFooter) count += 1;
  if (settings.enableInfiniteScroll !== defaults.enableInfiniteScroll) count += 1;
  if (
    settings.pinLeftColumns.join("|") !== DEFAULT_EMPLOYEES_PIN_LEFT.join("|") ||
    settings.pinRightColumns.length > 0
  ) {
    count += 1;
  }
  if (settings.hiddenColumnIds.join("|") !== DEFAULT_EMPLOYEES_HIDDEN.join("|")) {
    count += 1;
  }
  if (settings.columnOrder.join("|") !== EMPLOYEES_DATA_COLUMN_ORDER.join("|")) count += 1;
  if (
    EMPLOYEES_DATA_COLUMN_ORDER.some(
      (id) =>
        (settings.columnSizing[id] ?? DEFAULT_EMPLOYEES_COLUMN_SIZING[id]) !==
        DEFAULT_EMPLOYEES_COLUMN_SIZING[id],
    )
  ) {
    count += 1;
  }
  return count;
}

export function buildEmployeesMrtColumnOrder(settings: EmployeesTableSettings): string[] {
  const leading = settings.showMultiRowSelection
    ? ["mrt-row-select", "mrt-row-numbers"]
    : ["mrt-row-numbers"];
  return [...leading, ...settings.columnOrder, "mrt-row-actions"];
}

export function buildEmployeesColumnPinning(settings: EmployeesTableSettings) {
  const systemLeft = settings.showMultiRowSelection
    ? ["mrt-row-select", "mrt-row-numbers"]
    : ["mrt-row-numbers"];
  const userLeft = settings.pinLeftColumns.filter(
    (id) => !settings.pinRightColumns.includes(id),
  );
  const userRight = settings.pinRightColumns.filter(
    (id) => !settings.pinLeftColumns.includes(id),
  );
  return {
    left: [...systemLeft, ...userLeft],
    right: [...userRight, "mrt-row-actions"],
  };
}

export interface EmployeesTableSettingsDefaults {
  columnOrder: string[];
  columnSizing: Record<string, number>;
  pinLeftColumns: string[];
  hiddenColumnIds: string[];
}

export function buildEmployeesDefaults(): EmployeesTableSettingsDefaults {
  const defaults = defaultEmployeesTableSettings();
  return {
    columnOrder: [...defaults.columnOrder],
    columnSizing: { ...defaults.columnSizing },
    pinLeftColumns: [...defaults.pinLeftColumns],
    hiddenColumnIds: [...defaults.hiddenColumnIds],
  };
}

export function buildEmployeesTableSettingsLabels(
  d: Dictionary["system"]["employees"],
): AdminTableSettingsLabels {
  return {
    title: d.tableSettingsTitle,
    trigger: d.tableSettingsTrigger,
    behavior: d.tableSettingsBehavior,
    multiRowSelection: d.tableSettingsMultiRowSelection,
    summaryFooter: d.tableSettingsSummaryFooter,
    infiniteScroll: d.tableSettingsInfiniteScroll,
    pinLeft: d.tableSettingsPinLeft,
    pinRight: d.tableSettingsPinRight,
    locked: d.tableSettingsLocked,
    columnLayout: d.tableSettingsColumnLayout,
    colStt: d.tableSettingsColStt,
    colName: d.tableSettingsColName,
    columnWidth: d.tableSettingsColumnWidth,
    dragColumn: d.tableSettingsDragColumn,
    resetColumnLayout: d.tableSettingsResetColumnLayout,
    columnVisibility: d.tableSettingsColumnVisibility,
  };
}

export function buildEmployeesLayoutColumns(
  d: Dictionary["system"]["employees"],
  sc: Dictionary["system"]["common"],
): AdminTableColumnLayoutOption[] {
  return [
    { id: "code", label: d.code, defaultSize: 90, minSize: 72, maxSize: 140 },
    { id: "fullName", label: d.fullName, defaultSize: 200, minSize: 140, maxSize: 360 },
    { id: "emails", label: d.email, defaultSize: 220, minSize: 160, maxSize: 360 },
    { id: "gender", label: d.gender, defaultSize: 80, minSize: 64, maxSize: 120 },
    { id: "dateOfBirth", label: d.dateOfBirth, defaultSize: 110, minSize: 96, maxSize: 160 },
    { id: "positionName", label: d.positionId, defaultSize: 120, minSize: 100, maxSize: 180 },
    { id: "managerName", label: d.managerId, defaultSize: 140, minSize: 100, maxSize: 200 },
    { id: "departmentName", label: d.departmentName, defaultSize: 160, minSize: 120, maxSize: 240 },
    { id: "phones", label: d.phone, defaultSize: 150, minSize: 120, maxSize: 220 },
    { id: "jobTitle", label: d.jobTitle, defaultSize: 150, minSize: 120, maxSize: 220 },
    { id: "organizationName", label: d.organizationId, defaultSize: 140, minSize: 100, maxSize: 200 },
    { id: "startDate", label: d.startDate, defaultSize: 110, minSize: 96, maxSize: 160 },
    { id: "idInfo", label: d.idtype, defaultSize: 200, minSize: 160, maxSize: 280 },
    { id: "bankInfo", label: "Tài khoản ngân hàng", defaultSize: 200, minSize: 160, maxSize: 280 },
    { id: "staffStatusId", label: d.staffStatus ?? "Tình trạng NV", defaultSize: 130, minSize: 100, maxSize: 180 },
    { id: "isActive", label: sc.status, defaultSize: 160, minSize: 120, maxSize: 220 },
    { id: "created", label: sc.createdAt ?? "Ngày tạo", defaultSize: 170, minSize: 140, maxSize: 240 },
    { id: "updated", label: sc.updatedAt ?? "Cập nhật", defaultSize: 170, minSize: 140, maxSize: 240 },
    { id: "notes", label: d.notes ?? "Ghi chú", defaultSize: 180, minSize: 140, maxSize: 280 },
  ];
}

export function buildEmployeesLockedColumns(
  d: Dictionary["system"]["employees"],
  showMultiRowSelection: boolean,
): {
  left: AdminTableColumnLayoutOption[];
  right: AdminTableColumnLayoutOption[];
} {
  const sizeProps = { defaultSize: 0, minSize: 0, maxSize: 0 } as const;
  return {
    left: showMultiRowSelection
      ? [
        { id: "mrt-row-select", label: d.tableSettingsSelectColumn, ...sizeProps },
        // { id: "mrt-row-numbers", label: d.tableSettingsRowNumbers, ...sizeProps },
      ] : [],
    right: []
    //   : [{ id: "mrt-row-numbers", label: d.tableSettingsRowNumbers, ...sizeProps }],
    // right: [{ id: "mrt-row-actions", label: d.tableSettingsActions, ...sizeProps }],
  };
}

/**
 * Employee table settings — ported from the reference MRT module
 * (`plans/mockups/employees/lib/employees-table-settings.ts`).
 *
 * The structure is unchanged; only the display-column ids differ
 * (`mrt-row-*` → `dt-row-*`) and the builders emit plain TanStack state.
 */

import type {
  BaseTableSettings,
  TableColumnLayoutOption,
} from "@/components/table/settings";
import { DISPLAY_COLUMN_IDS } from "@/types/table";

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

export type EmployeesDataColumnId =
  (typeof EMPLOYEES_DATA_COLUMN_ORDER)[number];

export const DEFAULT_EMPLOYEES_COLUMN_SIZING: Record<
  EmployeesDataColumnId,
  number
> = {
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
export const DEFAULT_EMPLOYEES_HIDDEN: string[] = [];

export type EmployeesTableSettings = BaseTableSettings;

export function defaultEmployeesTableSettings(): EmployeesTableSettings {
  return {
    showMultiRowSelection: false,
    showSummaryFooter: false,
    enableInfiniteScroll: false,
    pinLeftColumns: [...DEFAULT_EMPLOYEES_PIN_LEFT],
    pinRightColumns: [],
    hiddenColumnIds: [...DEFAULT_EMPLOYEES_HIDDEN],
    columnOrder: [...EMPLOYEES_DATA_COLUMN_ORDER],
    columnSizing: { ...DEFAULT_EMPLOYEES_COLUMN_SIZING },
  };
}

/** Drop stored ids that no longer exist and append columns added since. */
export function reconcileEmployeesTableSettings(
  stored: EmployeesTableSettings,
): EmployeesTableSettings {
  const valid = new Set<string>(EMPLOYEES_DATA_COLUMN_ORDER);
  const filterIds = (ids: string[]) => ids.filter((id) => valid.has(id));

  const orderFiltered = filterIds(stored.columnOrder ?? []);
  const known = new Set(orderFiltered);
  const appended = EMPLOYEES_DATA_COLUMN_ORDER.filter((id) => !known.has(id));

  return {
    ...defaultEmployeesTableSettings(),
    ...stored,
    hiddenColumnIds: filterIds(stored.hiddenColumnIds ?? []),
    pinLeftColumns: filterIds(stored.pinLeftColumns ?? []),
    pinRightColumns: filterIds(stored.pinRightColumns ?? []),
    columnOrder: [...orderFiltered, ...appended],
    columnSizing: Object.fromEntries(
      Object.entries(stored.columnSizing ?? {}).filter(([id]) => valid.has(id)),
    ),
  };
}

/** Strip display-column ids — only data columns belong in stored prefs. */
export function filterEmployeesDataColumnSizing(
  sizing: Record<string, number>,
): Record<string, number> {
  const valid = new Set<string>(EMPLOYEES_DATA_COLUMN_ORDER);
  return Object.fromEntries(
    Object.entries(sizing).filter(([id]) => valid.has(id)),
  );
}

// ─── Settings → TanStack state ───────────────────────────────────────────────

export function buildEmployeesColumnVisibility(
  settings: EmployeesTableSettings,
): Record<string, boolean> {
  return Object.fromEntries(settings.hiddenColumnIds.map((id) => [id, false]));
}

export function buildEmployeesColumnSizing(
  settings: EmployeesTableSettings,
): Record<string, number> {
  return filterEmployeesDataColumnSizing(settings.columnSizing);
}

export function buildEmployeesColumnOrder(
  settings: EmployeesTableSettings,
): string[] {
  const leading = settings.showMultiRowSelection
    ? [DISPLAY_COLUMN_IDS.select, DISPLAY_COLUMN_IDS.numbers]
    : [DISPLAY_COLUMN_IDS.numbers];

  return [...leading, ...settings.columnOrder, DISPLAY_COLUMN_IDS.actions];
}

export function buildEmployeesColumnPinning(settings: EmployeesTableSettings) {
  const systemLeft = settings.showMultiRowSelection
    ? [DISPLAY_COLUMN_IDS.select, DISPLAY_COLUMN_IDS.numbers]
    : [DISPLAY_COLUMN_IDS.numbers];

  // Pin left wins when a column is somehow in both lists.
  const userLeft = settings.pinLeftColumns.filter(
    (id) => !settings.pinRightColumns.includes(id),
  );
  const userRight = settings.pinRightColumns.filter(
    (id) => !settings.pinLeftColumns.includes(id),
  );

  return {
    left: [...systemLeft, ...userLeft],
    right: [...userRight, DISPLAY_COLUMN_IDS.actions],
  };
}

export function buildEmployeesLayoutColumns(): TableColumnLayoutOption[] {
  return [
    { id: "code", label: "Mã NV", defaultSize: 90, minSize: 72, maxSize: 140 },
    {
      id: "fullName",
      label: "Họ tên",
      defaultSize: 200,
      minSize: 140,
      maxSize: 360,
    },
    {
      id: "emails",
      label: "Email",
      defaultSize: 220,
      minSize: 160,
      maxSize: 360,
    },
    {
      id: "gender",
      label: "Giới tính",
      defaultSize: 80,
      minSize: 64,
      maxSize: 120,
    },
    {
      id: "dateOfBirth",
      label: "Ngày sinh",
      defaultSize: 110,
      minSize: 96,
      maxSize: 160,
    },
    {
      id: "positionName",
      label: "Chức vụ",
      defaultSize: 120,
      minSize: 100,
      maxSize: 180,
    },
    {
      id: "managerName",
      label: "Quản lý",
      defaultSize: 140,
      minSize: 100,
      maxSize: 200,
    },
    {
      id: "departmentName",
      label: "Phòng ban",
      defaultSize: 160,
      minSize: 120,
      maxSize: 240,
    },
    {
      id: "phones",
      label: "Điện thoại",
      defaultSize: 150,
      minSize: 120,
      maxSize: 220,
    },
    {
      id: "jobTitle",
      label: "Chức danh",
      defaultSize: 150,
      minSize: 120,
      maxSize: 220,
    },
    {
      id: "organizationName",
      label: "Đơn vị",
      defaultSize: 140,
      minSize: 100,
      maxSize: 200,
    },
    {
      id: "startDate",
      label: "Ngày vào",
      defaultSize: 110,
      minSize: 96,
      maxSize: 160,
    },
    {
      id: "idInfo",
      label: "CCCD/CMND",
      defaultSize: 200,
      minSize: 160,
      maxSize: 280,
    },
    {
      id: "bankInfo",
      label: "Tài khoản ngân hàng",
      defaultSize: 200,
      minSize: 160,
      maxSize: 280,
    },
    {
      id: "staffStatusId",
      label: "Tình trạng NV",
      defaultSize: 130,
      minSize: 100,
      maxSize: 180,
    },
    {
      id: "isActive",
      label: "Trạng thái",
      defaultSize: 160,
      minSize: 120,
      maxSize: 220,
    },
    {
      id: "created",
      label: "Ngày tạo",
      defaultSize: 170,
      minSize: 140,
      maxSize: 240,
    },
    {
      id: "updated",
      label: "Cập nhật",
      defaultSize: 170,
      minSize: 140,
      maxSize: 240,
    },
    {
      id: "notes",
      label: "Ghi chú",
      defaultSize: 180,
      minSize: 140,
      maxSize: 280,
    },
  ];
}

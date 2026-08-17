"use client";

/**
 * EmployeesListScreen — tier 4 of the layering.
 *
 * Pure composition, no business logic:
 *   useEmployeesListData  → data (paginated + infinite unified)
 *   useTableSettings      → column layout / behavior, persisted to localStorage
 *   useEmployeesTable     → the table instance
 *   <DataTable>           → rendering
 *
 * Filters and the selected row live in the URL so the whole view is shareable.
 */

import { RefreshCw, UserPlus } from "lucide-react";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import {
  AppToolBar,
  AppToolBarActions,
  AppToolBarFilters,
} from "@/components/layouts/app-toolbar";
import { MasterDetailLayout } from "@/components/layouts/master-detail-layout/master-detail-layout";
import { TableFullscreenToggle } from "@/components/table";
import { TableSettings } from "@/components/table/settings";
import { TableFilters } from "@/components/table/table-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTableSettings } from "@/hooks/table/use-table-settings";
import type { Employee } from "@/mocks/employees";
import { EmployeesActionBar } from "../components/employees-action-bar";
import { EmployeesDetailPanel } from "../components/employees-detail-panel";
import {
  EMPLOYEES_FILTER_FORM_ID,
  EMPLOYEES_FILTER_KEYS,
  EmployeesFilterForm,
  type EmployeesFilterValues,
} from "../components/employees-filter-form";
import { useEmployeesListData } from "../hooks/use-employees-list-data";
import { useEmployeesTable } from "../hooks/use-employees-table";
import {
  buildEmployeesColumnPinning,
  buildEmployeesColumnVisibility,
  buildEmployeesLayoutColumns,
  defaultEmployeesTableSettings,
  filterEmployeesDataColumnSizing,
  parseEmployeesColumnPinning,
  parseEmployeesColumnVisibility,
  reconcileEmployeesTableSettings,
} from "../lib/employees-table-settings";

export function EmployeesListScreen() {
  const [search, setSearch] = useQueryStates({
    q: parseAsString.withDefault(""),
    org: parseAsInteger,
    dept: parseAsInteger,
    status: parseAsInteger,
    active: parseAsBoolean,
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(20),
    // Dòng đang xem chi tiết lưu theo `code` (vd `NV0003`) cho URL dễ đọc —
    // khác với `getRowId` của bảng (dùng `id`), nên bảng phải được chỉ rõ khoá
    // qua `getRowActiveKey`.
    selected: parseAsInteger,
  });

  // ── Settings ───────────────────────────────────────────────────────────────
  const settings = useTableSettings({
    tableId: "employees-list",
    version: 1,
    defaultValue: defaultEmployeesTableSettings,
    reconcile: reconcileEmployeesTableSettings,
  });

  // Wait for hydration before honoring the stored mode, otherwise the first
  // fetch runs against a default that localStorage is about to overwrite.
  const enableInfinite = settings.isHydrated
    ? settings.applied.enableInfiniteScroll
    : false;

  const layoutColumns = React.useMemo(() => buildEmployeesLayoutColumns(), []);

  // ── Data ───────────────────────────────────────────────────────────────────
  const list = useEmployeesListData(
    {
      searchKeyword: search.q,
      organizationId: search.org,
      departmentId: search.dept,
      staffStatusId: search.status,
      isActive: search.active,
      pageNumber: search.page,
      pageSize: search.perPage,
    },
    enableInfinite,
  );

  const activeEmployee = React.useMemo(
    () => list.items.find((item) => item.id === search.selected) ?? null,
    [list.items, search.selected],
  );

  // ── Filters ────────────────────────────────────────────────────────────────
  const activeFilterCount = React.useMemo(
    () => EMPLOYEES_FILTER_KEYS.filter((key) => search[key] != null).length,
    [search],
  );

  const onApplyFilters = React.useCallback(
    (values: EmployeesFilterValues) => {
      // Đổi bộ lọc thì luôn về trang 1, nếu không trang hiện tại có thể vượt
      // quá số trang của tập kết quả mới.
      void setSearch({ ...values, page: 1 });
    },
    [setSearch],
  );

  // ── Table ──────────────────────────────────────────────────────────────────
  const onColumnSizingChange = React.useCallback(
    (updater: unknown) => {
      const current = settings.applied.columnSizing;
      const raw =
        typeof updater === "function"
          ? (
              updater as (old: Record<string, number>) => Record<string, number>
            )(current)
          : (updater as Record<string, number>);
      // Resizing writes straight through — no Apply step for a drag gesture.
      settings.patchApplied({
        columnSizing: filterEmployeesDataColumnSizing(raw),
      });
    },
    [settings],
  );

  const onColumnPinningChange = React.useCallback(
    (updater: unknown) => {
      const current = buildEmployeesColumnPinning(settings.applied);
      const next =
        typeof updater === "function"
          ? (updater as (old: typeof current) => typeof current)(current)
          : (updater as typeof current);
      settings.patchApplied(parseEmployeesColumnPinning(next));
    },
    [settings],
  );

  const onColumnVisibilityChange = React.useCallback(
    (updater: unknown) => {
      const current = buildEmployeesColumnVisibility(settings.applied);
      const next =
        typeof updater === "function"
          ? (updater as (old: typeof current) => typeof current)(current)
          : (updater as typeof current);
      settings.patchApplied(parseEmployeesColumnVisibility(next));
    },
    [settings],
  );

  const onEdit = React.useCallback((employee: Employee) => {
    window.alert(`Demo: sửa nhân viên ${employee.fullName}`);
  }, []);

  const onRowClick = React.useCallback(
    (employee: Employee) => {
      void setSearch({ selected: employee.id });
    },
    [setSearch],
  );

  const { table } = useEmployeesTable({
    data: list.items,
    rowCount: list.totalCount,
    pageCount: list.pageCount,
    settings: settings.applied,
    onColumnSizingChange,
    onEdit,
    onRowClick,
    selectedRowId: search.selected,
    isLoading: list.isLoading || list.isFetchingNextPage,
    mode: enableInfinite ? "infinite" : "paginated",
    hasNextPage: list.hasNextPage,
    isFetchingNextPage: list.isFetchingNextPage,
    onFetchMore: list.fetchNextPage,
    pageSize: search.perPage,
    onColumnPinningChange,
    onColumnVisibilityChange,
  });

  // Toolbar riêng của màn hình. Truyền qua prop `topToolbar` của `<DataTable>`
  // nên nó nằm trong vùng fullscreen của bảng — bấm toàn màn hình vẫn thấy đủ
  // ô tìm kiếm, bộ lọc và các nút thao tác.
  const topToolbar = (
    <AppToolBar>
      <AppToolBarFilters>
        <Input
          placeholder="Tìm mã, tên, email, SĐT..."
          defaultValue={search.q}
          onChange={(event) =>
            void setSearch({ q: event.target.value, page: 1 })
          }
          className="h-8 w-56"
        />

        <TableFilters
          formId={EMPLOYEES_FILTER_FORM_ID}
          activeCount={activeFilterCount}
          onApply={onApplyFilters}
          disabled={list.isLoading}
        >
          <EmployeesFilterForm
            defaultValues={{
              org: search.org,
              dept: search.dept,
              status: search.status,
              active: search.active,
            }}
          />
        </TableFilters>
      </AppToolBarFilters>

      <AppToolBarActions>
        <Button
          aria-label="Tải lại"
          variant="outline"
          size="icon"
          className="size-8"
          onClick={list.refetch}
        >
          <RefreshCw className={list.isLoading ? "animate-spin" : undefined} />
        </Button>

        <TableSettings
          settings={settings}
          columns={layoutColumns}
          defaults={defaultEmployeesTableSettings}
          showInfiniteScrollSwitch
          onBeforeApply={(draft, applied) => {
            if (draft.enableInfiniteScroll !== applied.enableInfiniteScroll) {
              void setSearch({ page: 1 });
            }
          }}
        />
        <TableFullscreenToggle table={table} />

        <Button onClick={() => window.alert("Demo: thêm nhân viên")}>
          <UserPlus />
          Thêm nhân viên
        </Button>
      </AppToolBarActions>
    </AppToolBar>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col p-4">
      <MasterDetailLayout
        masterPanel={
          <div className="h-full min-h-0 flex-1">
            {settings.isHydrated ? (
              <DataTable
                table={table}
                topToolbar={topToolbar}
                className="h-full"
                actionBar={<EmployeesActionBar table={table} />}
              />
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </div>
        }
        detailPanel={(controls) => (
          <EmployeesDetailPanel
            employee={activeEmployee}
            isCollapsed={controls.isCollapsed}
            onToggle={controls.onToggle}
          />
        )}
      />
    </div>
  );
}

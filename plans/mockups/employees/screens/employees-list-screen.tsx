"use client";

/**
 * EmployeesListScreen
 * -------------------
 * Master-detail screen cho module Nhân viên.
 *
 * Composition (không chứa business logic — chỉ orchestrate):
 *   - `useEmployeesListData`  → data fetching (paginated / infinite unified)
 *   - `useAdminTableSettings` → column/settings state (localStorage sync)
 *   - `useEmployeesTable`     → MRT instance
 *   - `useEmployeeDetail`     → fresh employee cho detail panel
 *   - `EmployeesModals`       → CREATE/EDIT/LINK_USER sheets
 *   - `EmployeesChangeStatusManager` → CHANGE_STATUS dialog + mutation
 *
 * URL state (filter/keyword/selectedId) qua `useURLState` — persist toàn bộ
 * bộ lọc lên querystring, tránh state phân mảnh.
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { MRT_RowVirtualizer } from "material-react-table";

import { useT } from "@/lib/i18n/context";
import useURLState from "@/shared/hooks/useURLState";
import { AdminDataGrid } from "@/components/data-display/admin-data-grid";
import {
  AdminTableSettings,
  useAdminTableSettings,
} from "@/components/data-display/admin-table-settings";
import { ButtonApp } from "@/components/button/button-app";
import { ButtonRefresh } from "@/components/button/button-refresh";
import InputSearch from "@/components/forms/input-search";
import {
  AdminGridContainer,
  AdminPageShell,
  AppToolBar,
  AppToolBarActions,
  AppToolBarFilters,
  ExcelActions,
} from "@/components/layout";
import { AdminFilters } from "@/components/layout/admin-filters";
import { MasterDetailLayout } from "@/layouts/master-detail-layout/master-detail-layout";

import { OrganizationInternalSelect } from "../../organizations/components/organization-internal-select";
import EmployeeFilterForm, {
  EMPLOYEE_FILTER_FORM_ID,
} from "../components/employee-filter-form";
import { EmployeesDetailPanel } from "../components/employees-detail-panel";
import { EmployeesModals } from "../components/employees-modals";
import { useEmployeesContext } from "../context/employees-store";
import useEmployeesExcel from "../hooks/use-employees-excel";
import { useEmployeesListData } from "../hooks/use-employees-list-data";
import { useEmployeeDetail } from "../hooks/use-employees-query";
import { useEmployeesTable } from "../hooks/use-employees-table";
import {
  buildEmployeesColumnPinning,
  buildEmployeesDefaults,
  buildEmployeesLayoutColumns,
  buildEmployeesLockedColumns,
  buildEmployeesTableSettingsLabels,
  defaultEmployeesTableSettings,
  filterEmployeesDataColumnSizing,
  reconcileEmployeesTableSettings,
  type EmployeesTableSettings,
} from "../lib/employees-table-settings";
import { employeeFiltersSchema } from "../schemas/employee-filter-schema";

// ─── Component ────────────────────────────────────────────────────────────────

const EmployeesListScreen = () => {
  const { dict } = useT();
  const d = dict.system.employees;
  const sc = dict.system.common;

  // ── URL State ──────────────────────────────────────────────────────────────
  const {
    searchKeyword,
    isActive,
    organizationId,
    staffStatusId,
    positionId,
    managerId,
    departmentId,
    selectedId,
    pageNumber,
    pageSize,
    apiParams,
    setFiltersParams,
    activeFilterCount,
  } = useURLState(employeeFiltersSchema, {
    excludeKeys: ["selectedId"],
    filterKeys: [
      "organizationId",
      "staffStatusId",
      "positionId",
      "managerId",
      "departmentId",
      "isActive",
    ],
  });

  const handleApplyFilters = useCallback(
    (values: Record<string, unknown>) => {
      setFiltersParams({ ...values, pageNumber: 1 });
    },
    [setFiltersParams],
  );

  // ── Table Settings ─────────────────────────────────────────────────────────
  // Phải khởi tạo trước data fetching vì `enableInfiniteScroll` quyết định
  // chọn query nào (paginated vs infinite).
  const settings = useAdminTableSettings<EmployeesTableSettings>({
    tableId: "employees-list",
    version: 1,
    defaultValue: defaultEmployeesTableSettings,
    reconcile: reconcileEmployeesTableSettings,
  });

  // Chờ hydration xong mới dùng giá trị thực từ localStorage, tránh double fetch
  // (apply/enableInfiniteScroll default → true → localStorage value → false).
  const enableInfinite = settings.isHydrated
    ? settings.applied.enableInfiniteScroll
    : false;

  const handleTableSettingsBeforeApply = useCallback(
    (draft: EmployeesTableSettings, applied: EmployeesTableSettings) => {
      if (draft.enableInfiniteScroll !== applied.enableInfiniteScroll) {
        setFiltersParams({ pageNumber: 1 });
      }
    },
    [setFiltersParams],
  );

  // ── Data Fetching (unified paginated + infinite) ───────────────────────────
  const list = useEmployeesListData(apiParams, enableInfinite);
  const { items, totalCount, isLoading, isFetching, refetch, infinite } = list;

  // ── Active Employee ────────────────────────────────────────────────────────
  // `useEmployeeDetail` là source of truth (fresh sau mutation invalidate);
  // `items.find` chỉ là fallback cho lần render đầu trước khi detail load.
  const { data: detailEmployee } = useEmployeeDetail(selectedId ?? null);
  const activeEmployee = useMemo(() => {
    if (!selectedId) return null;
    return detailEmployee ?? items.find((e) => e.id === selectedId) ?? null;
  }, [detailEmployee, items, selectedId]);

  // ── Auto-select first row on initial load ──────────────────────────────────
  const autoSelectedRef = useRef(false);
  useEffect(() => {
    autoSelectedRef.current = false;
  }, [
    searchKeyword,
    organizationId,
    staffStatusId,
    positionId,
    managerId,
    departmentId,
    isActive,
  ]);
  useEffect(() => {
    if (isLoading || items.length === 0) return;
    if (selectedId) return;
    if (autoSelectedRef.current) return;
    autoSelectedRef.current = true;
    setFiltersParams({ selectedId: items[0]!.id });
  }, [isLoading, items, selectedId, setFiltersParams]);

  // ── Infinite scroll (refs + scroll-to-top on filter change) ────────────────
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizerRef = useRef<MRT_RowVirtualizer<any> | null>(null);

  const fetchMoreOnBottomReached = useCallback(
    (container?: HTMLDivElement | null) => {
      if (!infinite) return;
      const el = container ?? tableContainerRef.current;
      if (!el || infinite.isFetchingNextPage || !infinite.hasNextPage) return;
      const { scrollHeight, scrollTop, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < 400) {
        infinite.fetchNextPage();
      }
    },
    [infinite],
  );

  useEffect(() => {
    if (!enableInfinite) return;
    try {
      rowVirtualizerRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error("scrollToIndex failed", error);
    }
  }, [
    enableInfinite,
    searchKeyword,
    organizationId,
    staffStatusId,
    positionId,
    managerId,
    departmentId,
    isActive,
  ]);

  // ── Table Settings Labels / Columns (memoized derivations) ─────────────────
  const tableSettingsLabels = useMemo(
    () => buildEmployeesTableSettingsLabels(d),
    [d],
  );
  const layoutColumns = useMemo(
    () => buildEmployeesLayoutColumns(d, sc),
    [d, sc],
  );
  const lockedColumns = useMemo(
    () => buildEmployeesLockedColumns(d, settings.draft.showMultiRowSelection),
    [d, settings.draft.showMultiRowSelection],
  );
  const tableSettingsDefaults = useMemo(() => buildEmployeesDefaults(), []);
  const effectiveColumnPinning = useMemo(
    () => buildEmployeesColumnPinning(settings.applied),
    [settings.applied],
  );

  const handleColumnSizingChange = useCallback(
    (
      updater:
        | EmployeesTableSettings["columnSizing"]
        | ((
          old: EmployeesTableSettings["columnSizing"],
        ) => EmployeesTableSettings["columnSizing"]),
    ) => {
      const currentSizing = settings.applied.columnSizing;
      const rawSizing =
        typeof updater === "function" ? updater(currentSizing) : updater;
      const nextSizing = filterEmployeesDataColumnSizing(rawSizing);
      settings.patchApplied({ columnSizing: nextSizing });
    },
    [settings],
  );

  // ── Table Instance ─────────────────────────────────────────────────────────
  const table = useEmployeesTable({
    data: items,
    totalCount,
    onRowClick: (emp) => setFiltersParams({ selectedId: emp.id }),
    selectedRowId:
      activeEmployee?.id != null ? String(activeEmployee.id) : null,
    tableSettings: settings.applied,
    columnPinning: effectiveColumnPinning,
    onColumnSizingChange: handleColumnSizingChange,
    pagination: { pageIndex: pageNumber - 1, pageSize },
    onPaginationChange: (updater) => {
      const current = { pageIndex: pageNumber - 1, pageSize };
      const next = typeof updater === "function" ? updater(current) : updater;
      setFiltersParams({
        pageNumber: next.pageIndex + 1,
        pageSize: next.pageSize,
      });
    },
    mode: enableInfinite ? "infinite" : "paginated",
    isLoading,
    infinite: infinite
      ? {
        totalRowCount: totalCount,
        hasNextPage: infinite.hasNextPage,
        isFetchingNextPage: infinite.isFetchingNextPage,
        rowVirtualizerInstanceRef: rowVirtualizerRef,
        fetchMoreOnBottomReached,
      }
      : undefined,
  });

  // ── Toolbar handlers ───────────────────────────────────────────────────────
  const openModal = useEmployeesContext((s) => s.openModal);

  const excelDialogLabels = useMemo(
    () => ({
      title: d.excelMenu,
      trigger: d.excelMenu,
      downloadTemplate: d.downloadTemplate,
      downloadTemplateHint: d.downloadTemplate,
      import: d.importExcel,
      importHint: d.importExcel,
      export: d.exportExcel,
      exportHint: d.exportExcel,
    }),
    [d],
  );
  const { handleImportFile, handleDownloadTemplate, handleExport } =
    useEmployeesExcel(items);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <EmployeesModals />

      <AdminPageShell title={d.title}>
        <AppToolBar>
          <AppToolBarFilters>
            <InputSearch
              defaultValue={searchKeyword}
              onSubmit={(val) => setFiltersParams({ searchKeyword: val })}
            />
            <OrganizationInternalSelect
              value={organizationId ?? undefined}
              onChange={(v) =>
                setFiltersParams({
                  organizationId: v ?? undefined,
                  pageNumber: 1,
                })
              }
            />
            <AdminFilters
              disabled={isLoading}
              formId={EMPLOYEE_FILTER_FORM_ID}
              activeCount={activeFilterCount}
              onApply={handleApplyFilters}
            >
              <EmployeeFilterForm
                defaultValues={{
                  staffStatusId,
                  organizationId,
                  positionId,
                  managerId,
                  departmentId,
                  isActive,
                }}
              />
            </AdminFilters>
          </AppToolBarFilters>

          <AppToolBarActions>
            <ButtonRefresh
              onClick={() => refetch()}
              loading={isLoading || isFetching}
            />

            <AdminTableSettings<EmployeesTableSettings>
              settingsHook={settings}
              labels={tableSettingsLabels}
              layoutColumns={layoutColumns}
              defaultValues={tableSettingsDefaults}
              lockedLeftColumns={lockedColumns.left}
              lockedRightColumns={lockedColumns.right}
              trigger={{
                ariaLabel: d.tableSettingsTrigger,
                tooltip: d.tableSettingsTrigger,
                disabled: isFetching,
              }}
              clearLabel={dict.common.clearFilters}
              applyLabel={dict.common.applyFilters}
              onBeforeApply={handleTableSettingsBeforeApply}
            />

            <ExcelActions
              labels={excelDialogLabels}
              onDownloadTemplate={handleDownloadTemplate}
              onExport={handleExport}
              onImportFile={handleImportFile}
              disabled={isFetching}
              loading={isLoading}
            />

            <ButtonApp
              preset="add"
              onClick={() => openModal("CREATE")}
              loading={isLoading}
            >
              {d.addItem}
            </ButtonApp>
          </AppToolBarActions>
        </AppToolBar>

        <AdminGridContainer>
          {settings.isHydrated && (
            <MasterDetailLayout
              masterPanel={
                <AdminDataGrid
                  table={table}
                  showProgressBars={infinite?.isFetchingNextPage}
                  materialReactTableProps={
                    infinite
                      ? {
                        muiTableContainerProps: { ref: tableContainerRef },
                      }
                      : undefined
                  }
                />
              }
              detailPanel={(controls) => (
                <EmployeesDetailPanel
                  employee={activeEmployee}
                  onToggle={controls.onToggle}
                  isCollapsed={controls.isCollapsed}
                  className="border-0 rounded-none"
                />
              )}
            />
          )}
        </AdminGridContainer>
      </AdminPageShell>
    </>
  );
};

export default EmployeesListScreen;

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

import { Filter, RefreshCw, UserPlus } from "lucide-react";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { TableSettings } from "@/components/table/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTableSettings } from "@/hooks/table/use-table-settings";
import {
  departments,
  type Employee,
  organizations,
  staffStatuses,
} from "@/mocks/employees";

import { EmployeesDetailPanel } from "../components/employees-detail-panel";
import { useEmployeesListData } from "../hooks/use-employees-list-data";
import { useEmployeesTable } from "../hooks/use-employees-table";
import {
  buildEmployeesLayoutColumns,
  defaultEmployeesTableSettings,
  filterEmployeesDataColumnSizing,
  reconcileEmployeesTableSettings,
} from "../lib/employees-table-settings";
import { TableFullscreenToggle } from "@/components/table";

const ALL = "all";
const INFINITE_SCROLL_THRESHOLD_PX = 400;

export function EmployeesListScreen() {
  const [search, setSearch] = useQueryStates({
    q: parseAsString.withDefault(""),
    org: parseAsInteger,
    dept: parseAsInteger,
    status: parseAsInteger,
    active: parseAsBoolean,
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(20),
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

  // ── Infinite scroll ────────────────────────────────────────────────────────
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!enableInfinite) return;
    const element = containerRef.current?.querySelector(
      '[data-slot="data-table-container"]',
    );
    if (!element) return;

    function onScroll() {
      const el = element as HTMLElement;
      if (list.isFetchingNextPage || !list.hasNextPage) return;
      if (
        el.scrollHeight - el.scrollTop - el.clientHeight <
        INFINITE_SCROLL_THRESHOLD_PX
      ) {
        list.fetchNextPage();
      }
    }

    element.addEventListener("scroll", onScroll);
    return () => element.removeEventListener("scroll", onScroll);
  }, [enableInfinite, list]);

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
    selectedRowId: search.selected != null ? String(search.selected) : null,
    isLoading: list.isLoading || list.isFetchingNextPage,
    mode: enableInfinite ? "infinite" : "paginated",
    pageSize: search.perPage,
  });

  const [isDetailCollapsed, setIsDetailCollapsed] = React.useState(false);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col gap-3 p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-semibold text-lg">Nhân viên</h1>
          <p className="text-muted-foreground text-xs">
            {list.totalCount} nhân viên
            {enableInfinite ? ` · đã tải ${list.items.length}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Tìm mã, tên, email, SĐT..."
            defaultValue={search.q}
            onChange={(event) =>
              void setSearch({ q: event.target.value, page: 1 })
            }
            className="h-8 w-56"
          />

          <Button
            aria-label="Tải lại"
            variant="outline"
            size="icon"
            className="size-8"
          >
            <Filter
              className={list.isLoading ? "animate-spin" : undefined}
            />
          </Button>

          {/* <FilterSelect
            label="Đơn vị"
            value={search.org}
            options={organizations}
            onChange={(value) => void setSearch({ org: value, page: 1 })}
          />
          <FilterSelect
            label="Phòng ban"
            value={search.dept}
            options={departments}
            onChange={(value) => void setSearch({ dept: value, page: 1 })}
          />
          <FilterSelect
            label="Tình trạng"
            value={search.status}
            options={staffStatuses.map((s) => ({ id: s.id, name: s.label }))}
            onChange={(value) => void setSearch({ status: value, page: 1 })}
          /> */}

          <Button
            aria-label="Tải lại"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={list.refetch}
          >
            <RefreshCw
              className={list.isLoading ? "animate-spin" : undefined}
            />
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
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-3">
        <div ref={containerRef} className="min-w-0 flex-1">
          {settings.isHydrated ? (
            <DataTable table={table} className="h-full" />
          ) : (
            <Skeleton className="h-full w-full" />
          )}
        </div>

        <EmployeesDetailPanel
          employee={activeEmployee}
          isCollapsed={isDetailCollapsed}
          onToggle={() => setIsDetailCollapsed((prev) => !prev)}
          className={isDetailCollapsed ? "w-12" : "w-80 shrink-0"}
        />
      </div>
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: number | null;
  options: { id: number; name: string }[];
  onChange: (value: number | null) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <Select
      value={value != null ? String(value) : ALL}
      onValueChange={(next) => onChange(next === ALL ? null : Number(next))}
    >
      <SelectTrigger className="h-8 w-40 data-size:h-8" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: tất cả</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

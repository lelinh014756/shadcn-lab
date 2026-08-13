"use client";

/**
 * Unified data source for both list modes, mirroring `useEmployeesListData` in
 * the MRT reference module.
 *
 *   paginated — one page at a time, driven by pageNumber / pageSize
 *   infinite  — accumulates pages, `fetchNextPage` appends
 *
 * Only one mode is live at a time; switching resets the accumulated rows so the
 * two never interleave.
 */

import * as React from "react";

import {
  type Employee,
  type EmployeeListParams,
  employeesStore,
  getEmployees,
} from "@/mocks/employees";

export interface EmployeesListResult {
  items: Employee[];
  totalCount: number;
  pageCount: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export function useEmployeesListData(
  params: EmployeeListParams,
  enableInfinite: boolean,
): EmployeesListResult {
  const [items, setItems] = React.useState<Employee[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = React.useState(false);
  const [infinitePage, setInfinitePage] = React.useState(1);
  const [revision, setRevision] = React.useState(0);

  React.useEffect(
    () => employeesStore.subscribe(() => setRevision((prev) => prev + 1)),
    [],
  );

  const filterKey = JSON.stringify({
    searchKeyword: params.searchKeyword,
    organizationId: params.organizationId,
    departmentId: params.departmentId,
    positionId: params.positionId,
    managerId: params.managerId,
    staffStatusId: params.staffStatusId,
    isActive: params.isActive,
  });

  // Any filter change restarts the infinite accumulation from page 1.
  // biome-ignore lint/correctness/useExhaustiveDependencies: filterKey is the serialized filter identity
  React.useEffect(() => {
    setInfinitePage(1);
    setItems([]);
  }, [filterKey, enableInfinite]);

  const paramsRef = React.useRef(params);
  paramsRef.current = params;

  const pageNumber = enableInfinite ? infinitePage : params.pageNumber;
  const isAppending = enableInfinite && infinitePage > 1;

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the serialized query, not object identity
  React.useEffect(() => {
    let cancelled = false;
    if (isAppending) setIsFetchingNextPage(true);
    else setIsLoading(true);

    async function load() {
      const result = await getEmployees({
        ...paramsRef.current,
        pageNumber,
      });

      if (cancelled) return;

      setItems((prev) =>
        isAppending ? [...prev, ...result.items] : result.items,
      );
      setTotalCount(result.totalCount);
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    filterKey,
    pageNumber,
    params.pageSize,
    isAppending,
    revision,
    // Switching modes keeps pageNumber at 1, so without this the reset above
    // would clear the rows and nothing would refetch.
    enableInfinite,
  ]);

  const hasNextPage = enableInfinite && items.length < totalCount;

  const fetchNextPage = React.useCallback(() => {
    setInfinitePage((prev) => prev + 1);
  }, []);

  const refetch = React.useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  return {
    items,
    totalCount,
    pageCount: Math.max(1, Math.ceil(totalCount / params.pageSize)),
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  };
}

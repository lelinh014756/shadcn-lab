"use client";

/**
 * useEmployeesListData
 * --------------------
 * Consolidate 2 data-fetching mode của employees list:
 *   - Paginated  (`useEmployeesList`) — dùng khi settings tắt infinite scroll.
 *   - Infinite   (`useEmployeesInfiniteList`) — dùng khi bật.
 *
 * Trả ra một API thống nhất cho screen consumer:
 *   { items, totalCount, isLoading, isFetching, refetch, infinite: {...} }
 *
 * Chỉ một trong 2 query thật sự chạy (dựa `enabled`) — không có redundant fetch.
 *
 * @example
 * ```tsx
 * const enableInfinite = settings.applied.enableInfiniteScroll;
 * const list = useEmployeesListData(apiParams, enableInfinite);
 * // list.items, list.totalCount, list.refetch, ...
 * // list.infinite?.fetchNextPage nếu đang ở mode infinite
 * ```
 */

import { useMemo } from "react";
import type { Employee } from "../types/employee";
import type { EmployeeListParams } from "../types/employee-service";
import { useEmployeesList } from "./use-employees-query";
import { useEmployeesInfiniteList } from "./use-employees-infinite-list";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmployeesInfiniteState {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export interface EmployeesListData {
  items: Employee[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
  /** Có giá trị khi `enableInfinite = true`; null cho paginated mode. */
  infinite: EmployeesInfiniteState | null;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useEmployeesListData(
  apiParams: EmployeeListParams,
  enableInfinite: boolean,
): EmployeesListData {

  const paginated = useEmployeesList(apiParams, { enabled: !enableInfinite });
  const infinite = useEmployeesInfiniteList(apiParams, { enabled: enableInfinite });

  const items = useMemo<Employee[]>(() => {
    if (enableInfinite) {
      return infinite.data?.pages.flatMap((p) => p.items) ?? [];
    }
    return paginated.data?.items ?? [];
  }, [enableInfinite, infinite.data, paginated.data]);


  const totalCount = useMemo(() => {
    if (enableInfinite) {
      return infinite.data?.pages[0]?.totalCount ?? 0;
    }
    return paginated.data?.totalCount ?? 0;
  }, [enableInfinite, infinite.data, paginated.data]);

  return {
    items,
    totalCount,
    isLoading: enableInfinite ? infinite.isLoading : paginated.isLoading,
    isFetching: enableInfinite ? infinite.isFetching : paginated.isFetching,
    refetch: enableInfinite ? infinite.refetch : paginated.refetch,
    infinite: enableInfinite
      ? {
        fetchNextPage: () => void infinite.fetchNextPage(),
        hasNextPage: Boolean(infinite.hasNextPage),
        isFetchingNextPage: infinite.isFetchingNextPage,
      }
      : null,
  };
}

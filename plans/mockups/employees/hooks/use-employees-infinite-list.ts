"use client";

import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type InfiniteData,
} from "@tanstack/react-query";
import { employeesService } from "../services";
import type { Employee } from "../types/employee";
import type { EmployeeListParams } from "../types/employee-service";
import type { PaginatedResult } from "../../shared/types";
import { employeesKeys } from "./use-employees-query";

const INFINITE_PAGE_SIZE = 10;

export type UseEmployeesInfiniteListParams = Omit<
  EmployeeListParams,
  "pageNumber" | "pageSize" | "pageIndex"
>;

export function useEmployeesInfiniteList(
  params: UseEmployeesInfiniteListParams,
  options?: Partial<UseInfiniteQueryOptions<PaginatedResult<Employee>, Error, InfiniteData<PaginatedResult<Employee>>>>,
): UseInfiniteQueryResult<InfiniteData<PaginatedResult<Employee>>, Error> {
  return useInfiniteQuery({
    queryKey: employeesKeys.infiniteList({
      ...params,
      pageNumber: 1,
      pageSize: INFINITE_PAGE_SIZE,
    }),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      employeesService.getList({
        ...params,
        pageNumber: pageParam as number,
        pageSize: INFINITE_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pageIndex + 1 < lastPage.totalPages
        ? lastPage.pageIndex + 2
        : null,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: false,
    ...options,
  }) as UseInfiniteQueryResult<InfiniteData<PaginatedResult<Employee>>, Error>;
}

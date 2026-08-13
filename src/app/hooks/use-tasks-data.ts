"use client";

/**
 * Client-side data source for the tasks demo.
 *
 * Reads the same URL keys `useDataTable` owns (page / perPage / sort / filters
 * plus one key per filterable column) and re-queries the in-memory mock store
 * whenever they change — the client-side equivalent of the server component
 * that used to await the Drizzle queries.
 */

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";
import * as React from "react";

import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  getEstimatedHoursRange,
  getTaskPriorityCounts,
  getTaskStatusCounts,
  getTasks,
  type Task,
  taskPriorities,
  taskStatuses,
  tasksStore,
} from "@/mocks/tasks";

export interface TasksData {
  data: Task[];
  pageCount: number;
  statusCounts: Record<(typeof taskStatuses)[number], number>;
  priorityCounts: Record<(typeof taskPriorities)[number], number>;
  estimatedHoursRange: { min: number; max: number };
}

const EMPTY_DATA: TasksData = {
  data: [],
  pageCount: 0,
  statusCounts: { todo: 0, "in-progress": 0, done: 0, canceled: 0 },
  priorityCounts: { low: 0, medium: 0, high: 0 },
  estimatedHoursRange: { min: 0, max: 0 },
};

export function useTasksData({
  enableAdvancedFilter,
}: {
  enableAdvancedFilter: boolean;
}) {
  const [search] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<Task>().withDefault([
      { id: "createdAt", desc: true },
    ]),
    title: parseAsString.withDefault(""),
    status: parseAsArrayOf(parseAsStringEnum([...taskStatuses])).withDefault(
      [],
    ),
    priority: parseAsArrayOf(
      parseAsStringEnum([...taskPriorities]),
    ).withDefault([]),
    estimatedHours: parseAsArrayOf(parseAsInteger).withDefault([]),
    createdAt: parseAsArrayOf(parseAsInteger).withDefault([]),
    filters: getFiltersStateParser<Task>().withDefault([]),
    joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  });

  const [result, setResult] = React.useState<TasksData>(EMPTY_DATA);
  const [isPending, setIsPending] = React.useState(true);

  // Any mutation through the mock store re-runs the query below.
  const [revision, setRevision] = React.useState(0);
  React.useEffect(
    () => tasksStore.subscribe(() => setRevision((prev) => prev + 1)),
    [],
  );

  // nuqs hands back a fresh object every render, so the effect keys off the
  // serialized value and reads the live params through a ref.
  const searchKey = JSON.stringify(search);
  const searchRef = React.useRef(search);
  searchRef.current = search;

  // biome-ignore lint/correctness/useExhaustiveDependencies: searchKey and revision are deliberate re-run triggers, not values read in the effect body
  React.useEffect(() => {
    let cancelled = false;
    setIsPending(true);

    async function load() {
      const [tasks, statusCounts, priorityCounts, estimatedHoursRange] =
        await Promise.all([
          getTasks({
            ...searchRef.current,
            advancedFilter: enableAdvancedFilter,
          }),
          getTaskStatusCounts(),
          getTaskPriorityCounts(),
          getEstimatedHoursRange(),
        ]);

      if (cancelled) return;

      setResult({
        data: tasks.data,
        pageCount: tasks.pageCount,
        statusCounts,
        priorityCounts,
        estimatedHoursRange,
      });
      setIsPending(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [searchKey, enableAdvancedFilter, revision]);

  const refresh = React.useCallback(() => setRevision((prev) => prev + 1), []);

  return { ...result, isPending, refresh };
}

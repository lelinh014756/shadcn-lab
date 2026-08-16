/**
 * Mock tasks service — drop-in replacement for the Drizzle queries and server
 * actions that used to back the data-table demo. Same call signatures and same
 * `{ data, error }` result shape, so callers only change their import path.
 */

import type {
  ExtendedColumnFilter,
  ExtendedColumnSort,
  JoinOperator,
} from "@/components/data-table/types";
import { simulateLatency } from "@/lib/mock/mock-latency";
import { filterRows, paginateRows, sortRows } from "@/lib/mock/query-rows";
import {
  type Task,
  type TaskLabel,
  type TaskPriority,
  type TaskStatus,
  taskPriorities,
  taskStatuses,
} from "./task.types";
import { generateRandomTask, tasksStore } from "./tasks.mock";

export interface GetTasksInput {
  page: number;
  perPage: number;
  sort: ExtendedColumnSort<Task>[];
  title: string;
  status: TaskStatus[];
  priority: TaskPriority[];
  estimatedHours: number[];
  createdAt: number[];
  filters: ExtendedColumnFilter<Task>[];
  joinOperator: JoinOperator;
  advancedFilter?: boolean;
}

/** Basic-toolbar filters: applied as plain predicates, not the operator engine. */
function applyBasicFilters(rows: Task[], input: GetTasksInput): Task[] {
  return rows.filter((task) => {
    if (
      input.title &&
      !(task.title ?? "").toLowerCase().includes(input.title.toLowerCase())
    ) {
      return false;
    }
    if (input.status.length > 0 && !input.status.includes(task.status)) {
      return false;
    }
    if (input.priority.length > 0 && !input.priority.includes(task.priority)) {
      return false;
    }

    const [minHours, maxHours] = input.estimatedHours;
    if (minHours !== undefined && task.estimatedHours < minHours) return false;
    if (maxHours !== undefined && task.estimatedHours > maxHours) return false;

    const [fromDate, toDate] = input.createdAt;
    if (fromDate !== undefined) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      if (task.createdAt.getTime() < start.getTime()) return false;
    }
    if (toDate !== undefined) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      if (task.createdAt.getTime() > end.getTime()) return false;
    }

    return true;
  });
}

export async function getTasks(input: GetTasksInput) {
  await simulateLatency();

  const all = tasksStore.getAll();

  const filtered = input.advancedFilter
    ? filterRows(all, input.filters, input.joinOperator)
    : applyBasicFilters(all, input);

  const sorted =
    input.sort.length > 0
      ? sortRows(filtered, input.sort)
      : sortRows(filtered, [{ id: "createdAt", desc: false }]);

  const { data, pageCount } = paginateRows(sorted, input.page, input.perPage);

  return { data, pageCount };
}

export async function getTaskStatusCounts(): Promise<
  Record<TaskStatus, number>
> {
  await simulateLatency(80);

  const counts = Object.fromEntries(
    taskStatuses.map((status) => [status, 0]),
  ) as Record<TaskStatus, number>;

  for (const task of tasksStore.getAll()) {
    counts[task.status] += 1;
  }

  return counts;
}

export async function getTaskPriorityCounts(): Promise<
  Record<TaskPriority, number>
> {
  await simulateLatency(80);

  const counts = Object.fromEntries(
    taskPriorities.map((priority) => [priority, 0]),
  ) as Record<TaskPriority, number>;

  for (const task of tasksStore.getAll()) {
    counts[task.priority] += 1;
  }

  return counts;
}

export async function getEstimatedHoursRange() {
  await simulateLatency(80);

  const hours = tasksStore.getAll().map((task) => task.estimatedHours);
  if (hours.length === 0) return { min: 0, max: 0 };

  return { min: Math.min(...hours), max: Math.max(...hours) };
}

export interface CreateTaskInput {
  title: string;
  label: TaskLabel;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours?: number;
}

export async function createTask(input: CreateTaskInput) {
  await simulateLatency();

  try {
    const task = generateRandomTask({
      title: input.title,
      label: input.label,
      status: input.status,
      priority: input.priority,
      estimatedHours: input.estimatedHours ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    tasksStore.insert([task], "start");

    // Keep the total row count stable, matching the original demo behavior.
    const all = tasksStore.getAll();
    const oldest = all
      .filter((row) => row.id !== task.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    if (oldest) tasksStore.remove([oldest.id]);

    return { data: task, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function updateTask(
  input: Partial<CreateTaskInput> & { id: string },
) {
  await simulateLatency();

  const { id, ...patch } = input;
  const updated = tasksStore.update(id, { ...patch, updatedAt: new Date() });

  return updated
    ? { data: updated, error: null }
    : { data: null, error: "Task not found" };
}

export async function updateTasks(input: {
  ids: string[];
  label?: TaskLabel;
  status?: TaskStatus;
  priority?: TaskPriority;
}) {
  await simulateLatency();

  const patch: Partial<Task> = { updatedAt: new Date() };
  if (input.label) patch.label = input.label;
  if (input.status) patch.status = input.status;
  if (input.priority) patch.priority = input.priority;

  const updated = tasksStore.updateMany(input.ids, patch);

  return { data: updated, error: null };
}

export async function deleteTask(input: { id: string }) {
  return deleteTasks({ ids: [input.id] });
}

export async function deleteTasks(input: { ids: string[] }) {
  await simulateLatency();

  try {
    tasksStore.remove(input.ids);
    // Backfill so the dataset keeps its size, matching the original demo.
    tasksStore.insert(input.ids.map(() => generateRandomTask()));

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

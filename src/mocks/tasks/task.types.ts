/**
 * Task shape — previously inferred from the Drizzle `tasks` table.
 * Now the single source of truth for the data-table demo.
 */

export const taskStatuses = [
  "todo",
  "in-progress",
  "done",
  "canceled",
] as const;

export const taskPriorities = ["low", "medium", "high"] as const;

export const taskLabels = [
  "bug",
  "feature",
  "enhancement",
  "documentation",
] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type TaskLabel = (typeof taskLabels)[number];

export interface Task {
  id: string;
  code: string;
  title: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  label: TaskLabel;
  estimatedHours: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export type NewTask = Partial<Task>;

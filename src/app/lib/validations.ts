import * as z from "zod";

import { taskLabels, taskPriorities, taskStatuses } from "@/mocks/tasks";

export const createTaskSchema = z.object({
  title: z.string(),
  label: z.enum(taskLabels),
  status: z.enum(taskStatuses),
  priority: z.enum(taskPriorities),
  estimatedHours: z.number().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  label: z.enum(taskLabels).optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
  estimatedHours: z.number().optional(),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;

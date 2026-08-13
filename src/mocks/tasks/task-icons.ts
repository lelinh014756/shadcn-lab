import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Book,
  Bug,
  CheckCircle2,
  Circle,
  CircleCheck,
  CircleHelp,
  CircleX,
  type LucideIcon,
  Timer,
} from "lucide-react";

import type { TaskLabel, TaskPriority, TaskStatus } from "./task.types";

const statusIcons: Record<TaskStatus, LucideIcon> = {
  canceled: CircleX,
  done: CheckCircle2,
  "in-progress": Timer,
  todo: CircleHelp,
};

const priorityIcons: Record<TaskPriority, LucideIcon> = {
  high: ArrowUpIcon,
  low: ArrowDownIcon,
  medium: ArrowRightIcon,
};

const labelIcons: Record<TaskLabel, LucideIcon> = {
  bug: Bug,
  feature: Circle,
  enhancement: CircleCheck,
  documentation: Book,
};

export function getStatusIcon(status: TaskStatus) {
  return statusIcons[status];
}

export function getPriorityIcon(priority: TaskPriority) {
  return priorityIcons[priority];
}

export function getLabelIcon(label: TaskLabel) {
  return labelIcons[label];
}

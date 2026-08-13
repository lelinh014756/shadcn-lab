import { faker } from "@faker-js/faker";

import { createMockStore } from "@/lib/mock/mock-store";
import {
  type Task,
  taskLabels,
  taskPriorities,
  taskStatuses,
} from "./task.types";

const TASK_COUNT = 100;
const TASK_SEED = 20260812;

/**
 * Deterministic id — `generateId()` uses `Math.random()`, which would make the
 * seeded dataset differ between server and client render and break hydration.
 */
function mockId(prefix: string) {
  return `${prefix}_${faker.string.alphanumeric({ length: 12, casing: "mixed" })}`;
}

export function generateRandomTask(input?: Partial<Task>): Task {
  const createdAt = faker.date.recent({ days: 90 });

  return {
    id: mockId("task"),
    code: `TASK-${faker.string.numeric(4)}`,
    title: faker.hacker
      .phrase()
      .replace(/^./, (letter) => letter.toUpperCase()),
    estimatedHours: faker.number.int({ min: 1, max: 24 }),
    status: faker.helpers.arrayElement(taskStatuses),
    label: faker.helpers.arrayElement(taskLabels),
    priority: faker.helpers.arrayElement(taskPriorities),
    archived: faker.datatype.boolean({ probability: 0.2 }),
    createdAt,
    updatedAt: createdAt,
    ...input,
  };
}

function seedTasks(): Task[] {
  faker.seed(TASK_SEED);
  const rows = Array.from({ length: TASK_COUNT }, () => generateRandomTask());
  // Release the seed so ad-hoc generation (create/delete) stays varied.
  faker.seed();
  return rows;
}

export const tasksStore = createMockStore<Task>({
  seed: seedTasks,
  getKey: (task) => task.id,
});

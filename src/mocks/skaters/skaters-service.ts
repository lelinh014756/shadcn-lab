/**
 * Mock skaters service — replaces the `/api/skaters` route handler.
 * Runs entirely in the browser so the live demo needs no server or database.
 */

import { simulateLatency } from "@/lib/mock/mock-latency";

import type { Skater } from "./skater.types";
import { generateRandomSkater, skatersStore } from "./skaters.mock";

export async function listSkaters(): Promise<Skater[]> {
  await simulateLatency(120);
  return skatersStore.getAll();
}

export async function insertSkaters(
  input: Array<Partial<Skater> & { id?: string }>,
): Promise<Skater[]> {
  await simulateLatency(120);

  const rows = input.map((item) =>
    generateRandomSkater({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  );

  return skatersStore.insert(rows);
}

export async function updateSkaters(
  updates: Array<{ id: string; changes: Partial<Skater> }>,
): Promise<Skater[]> {
  await simulateLatency(120);

  const updated: Skater[] = [];
  for (const { id, changes } of updates) {
    const next = skatersStore.update(id, { ...changes, updatedAt: new Date() });
    if (next) updated.push(next);
  }

  return updated;
}

export async function deleteSkaters(ids: string[]): Promise<Skater[]> {
  await simulateLatency(120);
  return skatersStore.remove(ids);
}

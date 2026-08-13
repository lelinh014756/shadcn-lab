/**
 * Skater shape — previously inferred from the Drizzle `skaters` table.
 * Now the single source of truth for the data-grid live / multiplayer demos.
 */

import type { FileCellData } from "@/types/data-grid";

export const skaterStances = ["regular", "goofy"] as const;

export const skaterStyles = [
  "street",
  "vert",
  "park",
  "freestyle",
  "all-around",
] as const;

export const skaterStatuses = [
  "amateur",
  "sponsored",
  "pro",
  "legend",
] as const;

export type SkaterStance = (typeof skaterStances)[number];
export type SkaterStyle = (typeof skaterStyles)[number];
export type SkaterStatus = (typeof skaterStatuses)[number];

export interface Skater {
  id: string;
  order: number;
  name: string | null;
  email: string | null;
  stance: SkaterStance | null;
  style: SkaterStyle | null;
  status: SkaterStatus | null;
  yearsSkating: number | null;
  startedSkating: Date | null;
  isPro: boolean;
  tricks: string[] | null;
  media: FileCellData[] | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export type NewSkater = Partial<Skater>;

/**
 * Density and sticky presentation tokens.
 *
 * Landsoft's MRT setup locked density to "compact" with `!important` overrides,
 * which made the density toggle a visible no-op. Here the toggle is real: every
 * density maps to a distinct class set and nothing overrides it.
 */

import type { ColumnAlign, Density } from "@/types/table";

export const DENSITY_VALUES: Density[] = ["compact", "comfortable", "spacious"];

interface DensityTokens {
  cell: string;
  head: string;
  rowHeight: number;
}

const densityTokens: Record<Density, DensityTokens> = {
  compact: {
    cell: "px-3 py-1 text-xs",
    head: "h-8 px-3 text-xs",
    rowHeight: 32,
  },
  comfortable: {
    cell: "px-3 py-2 text-sm",
    head: "h-10 px-3 text-sm",
    rowHeight: 40,
  },
  spacious: {
    cell: "px-4 py-3.5 text-sm",
    head: "h-12 px-4 text-sm",
    rowHeight: 52,
  },
};

export function getDensityCellClass(density: Density) {
  return densityTokens[density].cell;
}

export function getDensityHeadClass(density: Density) {
  return densityTokens[density].head;
}

export function getDensityRowHeight(density: Density) {
  return densityTokens[density].rowHeight;
}

export function getNextDensity(density: Density): Density {
  const index = DENSITY_VALUES.indexOf(density);
  return DENSITY_VALUES[(index + 1) % DENSITY_VALUES.length] ?? "comfortable";
}

const alignClasses: Record<ColumnAlign, string> = {
  start: "text-left justify-start",
  center: "text-center justify-center",
  end: "text-right justify-end",
};

export function getAlignClass(align: ColumnAlign | undefined) {
  return align ? alignClasses[align] : alignClasses.start;
}

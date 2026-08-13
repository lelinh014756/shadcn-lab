import type { TableLocalization } from "@/types/table";

import { tableLocalizationEn } from "./en";
import { tableLocalizationVi } from "./vi";

export { tableLocalizationEn, tableLocalizationVi };

export const defaultTableLocalization = tableLocalizationEn;

/** Interpolate `{placeholder}` tokens, e.g. `filterByColumn`. */
export function formatLocalized(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function resolveLocalization(
  overrides?: Partial<TableLocalization>,
): TableLocalization {
  return overrides
    ? { ...defaultTableLocalization, ...overrides }
    : defaultTableLocalization;
}

/**
 * In-memory query engine — the client-side counterpart of the Drizzle
 * `filterColumns` SQL builder that used to live in `src/lib/filter-columns.ts`.
 *
 * Operator and value semantics mirror `dataTableConfig` exactly, including the
 * wire formats the URL parsers produce:
 *   - `date` / `dateRange` values are epoch-millisecond strings
 *   - `number` / `range` values are numeric strings
 *   - `boolean` values are `"true"` / `"false"`
 */

import { addDays, endOfDay, startOfDay } from "date-fns";

import type {
  ExtendedColumnFilter,
  ExtendedColumnSort,
  JoinOperator,
} from "@/components/data-table/types";

export function getRowValue<TData>(row: TData, id: string): unknown {
  return (row as Record<string, unknown>)[id];
}

/** Mirrors the `isEmpty` SQL helper: null, empty string, empty array/object. */
function getIsEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function toTime(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.getTime();
  const time = new Date(
    typeof value === "number" ? value : Number(value),
  ).getTime();
  return Number.isNaN(time) ? null : time;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(" ");
  return String(value);
}

function getIsDateVariant(variant: string) {
  return variant === "date" || variant === "dateRange";
}

function getIsNumberVariant(variant: string) {
  return variant === "number" || variant === "range";
}

/** Resolve a relative expression like `"3 days"` / `"-1 weeks"` to a day range. */
function getRelativeRange(value: string): [number, number] | null {
  const [amount, unit] = value.split(" ");
  if (!amount || !unit) return null;

  const parsed = Number.parseInt(amount, 10);
  if (Number.isNaN(parsed)) return null;

  const today = new Date();
  let start: Date;
  let end: Date;

  switch (unit) {
    case "days":
      start = startOfDay(addDays(today, parsed));
      end = endOfDay(start);
      break;
    case "weeks":
      start = startOfDay(addDays(today, parsed * 7));
      end = endOfDay(addDays(start, 6));
      break;
    case "months":
      start = startOfDay(addDays(today, parsed * 30));
      end = endOfDay(addDays(start, 29));
      break;
    default:
      return null;
  }

  return [start.getTime(), end.getTime()];
}

function matchesFilter<TData>(
  row: TData,
  filter: ExtendedColumnFilter<TData>,
): boolean {
  const value = getRowValue(row, filter.id);
  const { operator, variant } = filter;
  const filterValue = filter.value;

  switch (operator) {
    case "isEmpty":
      return getIsEmptyValue(value);

    case "isNotEmpty":
      return !getIsEmptyValue(value);

    case "iLike":
      return (
        typeof filterValue === "string" &&
        toText(value).toLowerCase().includes(filterValue.toLowerCase())
      );

    case "notILike":
      return (
        typeof filterValue === "string" &&
        !toText(value).toLowerCase().includes(filterValue.toLowerCase())
      );

    case "eq": {
      if (variant === "boolean") return String(value) === String(filterValue);
      if (getIsDateVariant(variant)) {
        const time = toTime(value);
        const target = toTime(filterValue);
        if (time === null || target === null) return false;
        return (
          time >= startOfDay(new Date(target)).getTime() &&
          time <= endOfDay(new Date(target)).getTime()
        );
      }
      if (Array.isArray(value)) return value.includes(filterValue);
      return String(value ?? "") === String(filterValue ?? "");
    }

    case "ne": {
      if (variant === "boolean") return String(value) !== String(filterValue);
      if (getIsDateVariant(variant)) {
        const time = toTime(value);
        const target = toTime(filterValue);
        if (time === null || target === null) return true;
        return (
          time < startOfDay(new Date(target)).getTime() ||
          time > endOfDay(new Date(target)).getTime()
        );
      }
      return String(value ?? "") !== String(filterValue ?? "");
    }

    case "inArray": {
      if (!Array.isArray(filterValue)) return false;
      if (Array.isArray(value)) {
        return value.some((item) => filterValue.includes(String(item)));
      }
      return filterValue.includes(String(value ?? ""));
    }

    case "notInArray": {
      if (!Array.isArray(filterValue)) return false;
      if (Array.isArray(value)) {
        return !value.some((item) => filterValue.includes(String(item)));
      }
      return !filterValue.includes(String(value ?? ""));
    }

    case "lt":
    case "lte":
    case "gt":
    case "gte": {
      let left: number | null;
      let right: number | null;

      if (getIsDateVariant(variant)) {
        left = toTime(value);
        const target = toTime(filterValue);
        if (target === null) return false;
        // Compare against the day boundary so a whole day counts as one point.
        right =
          operator === "lt" || operator === "lte"
            ? endOfDay(new Date(target)).getTime()
            : startOfDay(new Date(target)).getTime();
      } else if (getIsNumberVariant(variant)) {
        left = toNumber(value);
        right = toNumber(filterValue);
      } else {
        return false;
      }

      if (left === null || right === null) return false;

      if (operator === "lt") return left < right;
      if (operator === "lte") return left <= right;
      if (operator === "gt") return left > right;
      return left >= right;
    }

    case "isBetween": {
      if (!Array.isArray(filterValue) || filterValue.length !== 2) return false;
      const [rawStart, rawEnd] = filterValue;

      if (getIsDateVariant(variant)) {
        const time = toTime(value);
        if (time === null) return false;
        const startTime = rawStart
          ? startOfDay(new Date(Number(rawStart))).getTime()
          : null;
        const endTime = rawEnd
          ? endOfDay(new Date(Number(rawEnd))).getTime()
          : null;
        if (startTime !== null && time < startTime) return false;
        if (endTime !== null && time > endTime) return false;
        return startTime !== null || endTime !== null;
      }

      if (getIsNumberVariant(variant)) {
        const num = toNumber(value);
        if (num === null) return false;
        const min = toNumber(rawStart);
        const max = toNumber(rawEnd);
        if (min === null && max === null) return true;
        if (min !== null && max === null) return num === min;
        if (min === null && max !== null) return num === max;
        return num >= (min as number) && num <= (max as number);
      }

      return false;
    }

    case "isRelativeToToday": {
      if (!getIsDateVariant(variant) || typeof filterValue !== "string") {
        return false;
      }
      const range = getRelativeRange(filterValue);
      const time = toTime(value);
      if (!range || time === null) return false;
      return time >= range[0] && time <= range[1];
    }

    default:
      return true;
  }
}

export function filterRows<TData>(
  rows: TData[],
  filters: ExtendedColumnFilter<TData>[],
  joinOperator: JoinOperator = "and",
): TData[] {
  if (filters.length === 0) return rows;

  return rows.filter((row) =>
    joinOperator === "and"
      ? filters.every((filter) => matchesFilter(row, filter))
      : filters.some((filter) => matchesFilter(row, filter)),
  );
}

export function sortRows<TData>(
  rows: TData[],
  sorting: ExtendedColumnSort<TData>[],
): TData[] {
  if (sorting.length === 0) return rows;

  return [...rows].sort((a, b) => {
    for (const { id, desc } of sorting) {
      const left = getRowValue(a, id);
      const right = getRowValue(b, id);

      if (left === right) continue;
      if (left === null || left === undefined) return desc ? -1 : 1;
      if (right === null || right === undefined) return desc ? 1 : -1;

      let result: number;
      if (left instanceof Date && right instanceof Date) {
        result = left.getTime() - right.getTime();
      } else if (typeof left === "number" && typeof right === "number") {
        result = left - right;
      } else if (typeof left === "boolean" && typeof right === "boolean") {
        result = Number(left) - Number(right);
      } else {
        result = String(left).localeCompare(String(right), undefined, {
          numeric: true,
        });
      }

      if (result !== 0) return desc ? -result : result;
    }
    return 0;
  });
}

export function paginateRows<TData>(
  rows: TData[],
  page: number,
  perPage: number,
): { data: TData[]; total: number; pageCount: number } {
  const total = rows.length;
  const pageCount = perPage > 0 ? Math.ceil(total / perPage) : 0;
  const offset = Math.max(0, (page - 1) * perPage);

  return {
    data: rows.slice(offset, offset + perPage),
    total,
    pageCount,
  };
}

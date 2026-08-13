/**
 * Column geometry helpers shared by both renderers.
 *
 * `getColumnPinningStyle` previously existed twice — once in `lib/data-table.ts`
 * (semantic table, boxShadow separators) and once in `lib/data-grid.ts` (CSS
 * grid, RTL-aware). This is the merged implementation; `layoutMode` and `dir`
 * select the behavior.
 */

import type { Column } from "@tanstack/react-table";

import type { Direction } from "@/types/data-grid";
import type { LayoutMode } from "@/types/table";

/** Approximate width of one header character, used to derive a minimum size. */
const HEADER_CHAR_WIDTH_PX = 8.5;
const HEADER_ICON_WIDTH_PX = 28;
const HEADER_PADDING_PX = 24;

export function getColumnPinningStyle<TData>({
  column,
  dir = "ltr",
  layoutMode = "semantic",
  withBorder = false,
}: {
  column: Column<TData>;
  dir?: Direction;
  layoutMode?: LayoutMode;
  withBorder?: boolean;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();

  if (!isPinned) {
    return layoutMode === "grid"
      ? { position: "relative" }
      : { position: "relative", width: column.getSize() };
  }

  const isLastLeftPinned =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinned =
    isPinned === "right" && column.getIsFirstColumn("right");

  const startOffset = `${column.getStart("left")}px`;
  const endOffset = `${column.getAfter("right")}px`;
  const isRtl = dir === "rtl";

  return {
    position: "sticky",
    // In RTL the visual "left" edge is `right`, so the offsets swap.
    left:
      isPinned === "left"
        ? isRtl
          ? undefined
          : startOffset
        : isRtl
          ? endOffset
          : undefined,
    right:
      isPinned === "right"
        ? isRtl
          ? undefined
          : endOffset
        : isRtl
          ? startOffset
          : undefined,
    zIndex: isPinned === "left" ? 2 : 3,
    background: "var(--background)",
    boxShadow: withBorder
      ? isLastLeftPinned
        ? "-4px 0 4px -4px var(--border) inset"
        : isFirstRightPinned
          ? "4px 0 4px -4px var(--border) inset"
          : undefined
      : undefined,
    ...(layoutMode === "semantic" ? { width: column.getSize() } : null),
  };
}

/**
 * Bump `minSize` so a header label is never clipped before the user resizes.
 * Ported from Landsoft's `withHeaderAwareColumnSizes`.
 *
 * Documented consequence: a column declaring `size: 90` with the header
 * "Description" ends up at ~110 — the header width wins.
 */
export function getHeaderAwareMinSize({
  label,
  minSize,
  hasSortIcon = false,
}: {
  label: string;
  minSize?: number;
  hasSortIcon?: boolean;
}): number {
  const textWidth = label.length * HEADER_CHAR_WIDTH_PX;
  const iconWidth = hasSortIcon ? HEADER_ICON_WIDTH_PX : 0;
  const required = Math.ceil(textWidth + iconWidth + HEADER_PADDING_PX);

  return Math.max(minSize ?? 0, required);
}

/** Header text of a column def, when it is a plain string. */
export function getHeaderLabel(header: unknown, fallback: string): string {
  return typeof header === "string" ? header : fallback;
}

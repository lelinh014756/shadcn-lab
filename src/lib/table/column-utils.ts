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
  background = "var(--background)",
}: {
  column: Column<TData>;
  dir?: Direction;
  layoutMode?: LayoutMode;
  withBorder?: boolean;
  /**
   * Nền cho ô đang ghim (phải đặc, không alpha) — mặc định khớp nền trang.
   * Header truyền `var(--muted)` để khớp với nền `bg-muted` của `<thead>`,
   * tránh mảng ghim nổi màu khác với phần header còn lại.
   */
  background?: string;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();

  if (!isPinned) {
    return layoutMode === "grid"
      ? { position: "relative" }
      : { position: "relative", width: column.getSize() };
  }

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
    background,
    // Viền phân cách của MỌI cột đang ghim (không chỉ cột ở rìa vùng ghim):
    // trái ghim vẽ ở cạnh phải, phải ghim vẽ ở cạnh trái. Bắt buộc dùng inset
    // box-shadow thay vì class `border-e` — các cột ghim cùng z-index (2/3),
    // cột đứng sau trong DOM vẽ đè lên cột đứng trước tại đúng pixel giáp
    // ranh, nên border-e (vẽ ở mép ngoài box) dễ bị cột kế tiếp che mất.
    // box-shadow inset vẽ lùi vào bên trong 1px, nằm trong vùng sơn riêng
    // của chính cột đó nên không bị cột khác đè.
    boxShadow: withBorder
      ? isPinned === "left"
        ? "inset -1px 0 0 0 var(--border)"
        : "inset 1px 0 0 0 var(--border)"
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

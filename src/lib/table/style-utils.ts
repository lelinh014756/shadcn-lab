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
  /**
   * Padding cho trigger dropdown trong header (sort/pin/hide) — PHẢI khớp
   * đúng padding ngang của `head` ở trên, không hardcode riêng một số khác.
   *
   * Trigger phủ trọn `<th>` bằng `position: absolute; inset: 0` (không phải
   * `width: 100%` bình thường) rồi tự padding lại để label/chevron cách đều
   * hai mép. Từng thử "margin âm + padding cùng số, không set width tường
   * minh" để nền hover phủ kín cả ô — nhưng `display: flex` với `width: auto`
   * co theo NỘI DUNG (shrink-to-fit) chứ không giãn hết khung cha, nên cột
   * càng rộng thì trigger càng ngắn lại, chevron tụt hẳn về gần label thay vì
   * dạt sang mép phải. `absolute inset-0` không có sự mơ hồ đó — kích thước
   * luôn bằng đúng khung chứa, bất kể nội dung bên trong. Không tính động
   * bằng `px-${n}` được vì Tailwind cần thấy class name tĩnh lúc build để
   * sinh CSS.
   */
  headMenuInset: string;
  rowHeight: number;
}

const densityTokens: Record<Density, DensityTokens> = {
  compact: {
    cell: "px-3 py-1 text-xs",
    head: "h-8 px-3 text-xs",
    headMenuInset: "px-3",
    rowHeight: 32,
  },
  comfortable: {
    cell: "px-3 py-2 text-sm",
    head: "h-10 px-3 text-sm",
    headMenuInset: "px-3",
    rowHeight: 40,
  },
  spacious: {
    cell: "px-4 py-3.5 text-sm",
    head: "h-12 px-4 text-sm",
    headMenuInset: "px-4",
    rowHeight: 52,
  },
};

export function getDensityCellClass(density: Density) {
  return densityTokens[density].cell;
}

export function getDensityHeadClass(density: Density) {
  return densityTokens[density].head;
}

export function getDensityHeadMenuInsetClass(density: Density) {
  return densityTokens[density].headMenuInset;
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

/**
 * Column geometry helpers shared by both renderers.
 *
 * `getColumnPinningStyle` previously existed twice — once in `lib/data-table.ts`
 * (semantic table, boxShadow separators) and once in `lib/data-grid.ts` (CSS
 * grid, RTL-aware). This is the merged implementation; `dir` selects the
 * left/right offset behavior for RTL.
 *
 * Cố ý KHÔNG trả số px nào ở đây — cả độ rộng lẫn offset ghim đều đi qua CSS
 * variable (`computeColumnSizeVars` + `calc(var(...) * 1px)` ở nơi gọi) để
 * resize mượt, không phụ thuộc React re-render.
 */

import type { Column } from "@tanstack/react-table";

import type { Direction } from "@/types/data-grid";

export function getColumnPinningStyle<TData>({
  column,
  dir = "ltr",
  withBorder = false,
  borderColor = "var(--border)",
  background = "var(--row-pinned-bg, var(--background))",
}: {
  column: Column<TData>;
  dir?: Direction;
  withBorder?: boolean;
  /**
   * Màu đường phân cách. Tách ra tham số vì `--border` chỉ đủ tương phản trên
   * nền trắng của body — ở header đã tô màu, nó gần như trùng nền và biến mất.
   */
  borderColor?: string;
  /**
   * Nền cho ô đang ghim (phải đặc, không alpha) — mặc định khớp nền trang,
   * nhưng đi qua biến `--row-pinned-bg` trước khi rơi về `--background`.
   *
   * Lý do có lớp gián tiếp này: ô ghim BẮT BUỘC nền đặc (để che nội dung
   * cuộn bên dưới), nên nó luôn đè lên mọi nền `<tr>` set bằng class Tailwind
   * (`bg-primary/5`...) — hàng nào tô màu để đánh dấu (đang chọn, đang hover
   * cố định...) thì các cột ghim của hàng đó vẫn trắng trơn, lạc màu. Đặt
   * `--row-pinned-bg` trên `<tr>` (ví dụ qua class `[--row-pinned-bg:...]`)
   * là cách duy nhất xuyên được vào bên trong nền đặc của ô ghim, vì biến CSS
   * cascade qua `var()` còn màu nền thì không. Không hàng nào set biến này
   * thì fallback về `--background` y hệt trước đây.
   *
   * Header truyền thẳng `var(--muted)` (bỏ qua lớp gián tiếp) để khớp nền
   * `bg-muted` của `<thead>`, tránh mảng ghim nổi màu khác với header còn lại.
   */
  background?: string;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();

  if (!isPinned) {
    return { position: "relative" };
  }

  // Offset ghim cũng đi qua biến CSS chứ không phải số px tính lúc render:
  // `column.getStart("left")` chỉ đúng sau khi React render lại, nên kéo một
  // cột ghim sẽ không thể mượt nếu neo vào nó. Xem `computeColumnSizeVars`.
  const startOffset = `calc(var(--col-${column.id}-start, 0) * 1px)`;
  const endOffset = `calc(var(--col-${column.id}-end, 0) * 1px)`;
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
        ? `inset -1px 0 0 0 ${borderColor}`
        : `inset 1px 0 0 0 ${borderColor}`
      : undefined,
  };
}

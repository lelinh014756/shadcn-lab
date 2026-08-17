"use client";

/**
 * Cuộn vô hạn cho `DataTableContainer`.
 *
 * Trước đây mỗi màn hình tự viết lại đúng khối này: `useRef` trỏ vào
 * `<DataTable>`, `querySelector('[data-slot="table-container"]')`, gắn/gỡ
 * listener, so `scrollHeight - scrollTop - clientHeight` với ngưỡng. Bốn bước
 * đó không hề đặc thù theo màn hình — chỉ `onFetchMore` mới là. Gom vào đây
 * thì màn hình chỉ còn khai báo dữ liệu (`hasNextPage`, `isFetchingNextPage`,
 * `onFetchMore`) và không cần biết phần tử nào thật sự cuộn.
 *
 * Vì sao nghe scroll trên `[data-slot="table-container"]` chứ không phải phần
 * tử ngoài cùng: cái cuộn thật là div bọc `<table>` bên trong `ui/table.tsx`
 * (`overflow-auto`), còn `data-table-container` bên ngoài chỉ là khung flex.
 *
 * HAI cơ chế kích hoạt, thiếu cái nào cũng kẹt:
 *
 *   1. Sự kiện `scroll` — người dùng cuộn tới gần đáy.
 *   2. Tự lấp đầy — trang đầu ngắn hơn khung thì KHÔNG có thanh cuộn, nên
 *      không bao giờ có sự kiện `scroll` nào để mà nghe. Bảng đứng im ở
 *      `pageSize` dòng đầu tiên dù còn dữ liệu. Cơ chế này nạp tiếp cho tới
 *      khi đủ dài để cuộn (hoặc hết dữ liệu).
 */

import * as React from "react";

const SCROLLER_SELECTOR = '[data-slot="table-container"]';

interface UseInfiniteScrollProps {
  /** Ref tới phần tử BAO NGOÀI vùng cuộn — hook tự tìm vùng cuộn bên trong. */
  containerRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean | undefined;
  onFetchMore: (() => void) | undefined;
  threshold: number;
  /**
   * Số dòng đang hiển thị. Là mốc để biết lần tự lấp đầy trước đã có tác dụng
   * hay chưa — xem `autoFilledAtRef`.
   */
  rowCount: number;
}

export function useInfiniteScroll({
  containerRef,
  enabled,
  hasNextPage,
  isFetchingNextPage,
  onFetchMore,
  threshold,
  rowCount,
}: UseInfiniteScrollProps) {
  // Giữ trong ref để effect chỉ chạy lại khi thật sự bật/tắt, không phải mỗi
  // lần `onFetchMore` đổi identity (closure mới sau mỗi lần fetch) — nếu để
  // vào deps thì listener bị gỡ/gắn liên tục giữa lúc người dùng đang cuộn.
  const stateRef = React.useRef({
    hasNextPage,
    isFetchingNextPage,
    onFetchMore,
  });
  stateRef.current = { hasNextPage, isFetchingNextPage, onFetchMore };

  React.useEffect(() => {
    if (!enabled) return;

    const element =
      containerRef.current?.querySelector<HTMLElement>(SCROLLER_SELECTOR);
    if (!element) return;

    function onScroll() {
      const { hasNextPage, isFetchingNextPage, onFetchMore } = stateRef.current;
      if (!element || isFetchingNextPage || !hasNextPage) return;

      const remaining =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining < threshold) onFetchMore?.();
    }

    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, [containerRef, enabled, threshold]);

  // Mốc `rowCount` của lần tự nạp gần nhất. Nếu nạp xong mà số dòng không tăng
  // (API báo còn trang nhưng trả về rỗng), điều kiện `=== rowCount` sẽ chặn
  // vòng lặp vô hạn thay vì gọi mãi.
  const autoFilledAtRef = React.useRef(-1);

  React.useEffect(() => {
    if (!enabled || !hasNextPage || isFetchingNextPage) return;
    if (autoFilledAtRef.current === rowCount) return;

    const element =
      containerRef.current?.querySelector<HTMLElement>(SCROLLER_SELECTOR);
    // `clientHeight === 0`: chưa layout xong (hoặc đang ẩn) — chưa biết được
    // có cần nạp thêm không, để lần render sau tính lại.
    if (!element || element.clientHeight === 0) return;

    if (element.scrollHeight - element.clientHeight >= threshold) return;

    autoFilledAtRef.current = rowCount;
    onFetchMore?.();
  }, [
    containerRef,
    enabled,
    hasNextPage,
    isFetchingNextPage,
    onFetchMore,
    rowCount,
    threshold,
  ]);
}

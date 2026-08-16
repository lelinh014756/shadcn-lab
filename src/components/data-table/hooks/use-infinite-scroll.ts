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
 */

import * as React from "react";

interface UseInfiniteScrollProps {
  /** Ref tới phần tử BAO NGOÀI vùng cuộn — hook tự tìm vùng cuộn bên trong. */
  containerRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean | undefined;
  onFetchMore: (() => void) | undefined;
  threshold: number;
}

export function useInfiniteScroll({
  containerRef,
  enabled,
  hasNextPage,
  isFetchingNextPage,
  onFetchMore,
  threshold,
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

    const element = containerRef.current?.querySelector<HTMLElement>(
      '[data-slot="table-container"]',
    );
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
}

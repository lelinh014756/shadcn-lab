"use client";

/**
 * MasterDetailLayout
 * ------------------
 * Shared layout master-detail với collapse support.
 *
 * Cách collapse hoạt động:
 * - Thu gọn = resize detail panel xuống chiều cao header (pixel).
 * - Mở rộng = khôi phục pixel đã lưu trước khi thu gọn; không nhớ thì dùng mặc định (px).
 * - v4 react-resizable-panels: số truyền vào resize/minSize = pixel.
 */

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { usePanelRef, type PanelSize } from "react-resizable-panels";

/** Chiều cao panel detail khi thu gọn — khớp header DetailPanelShell (~32px). */
const DEFAULT_COLLAPSED_DETAIL_HEADER_PX = 32;

const COLLAPSED_THRESHOLD_PX = 2;

function isPanelCollapsed(panelSize: PanelSize, collapsedHeaderPx: number) {
  return panelSize.inPixels <= collapsedHeaderPx + COLLAPSED_THRESHOLD_PX;
}

export type DetailPanelControls = {
  onToggle: () => void;
  isCollapsed: boolean;
};

interface MasterDetailLayoutProps {
  masterPanel: React.ReactNode;
  detailPanel: (controls: DetailPanelControls) => React.ReactNode;
  /** % chiều cao mặc định cho master (0-100). Default: 50. */
  defaultMasterSize?: number;
  /** % tối thiểu cho master. Default: 50. */
  minMasterSize?: number;
  /** % tối thiểu cho detail khi mở rộng. Default: 35. */
  minDetailSize?: number;
  /** Chiều cao detail khi thu gọn (pixel) — chỉ đủ header. */
  collapsedDetailHeaderPx?: number;
  initialDetailCollapsed?: boolean;
  onDetailCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

export function MasterDetailLayout({
  masterPanel,
  detailPanel,
  defaultMasterSize = 50,
  minMasterSize = 50,
  minDetailSize: _minDetailSize = 35,
  collapsedDetailHeaderPx = DEFAULT_COLLAPSED_DETAIL_HEADER_PX,
  initialDetailCollapsed = false,
  onDetailCollapsedChange,
  className,
}: MasterDetailLayoutProps) {
  const detailRef = usePanelRef();
  const groupElementRef = useRef<HTMLDivElement | null>(null);
  /** Pixel height trước khi user thu gọn lần gần nhất. */
  const savedDetailExpandedPxRef = useRef<number | null>(null);
  /** Pixel height mặc định (50/50 hoặc theo defaultMasterSize). */
  const defaultDetailExpandedPxRef = useRef<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(initialDetailCollapsed);

  const resolveDefaultExpandedPx = useCallback(() => {
    if (defaultDetailExpandedPxRef.current != null) {
      return defaultDetailExpandedPxRef.current;
    }

    const groupHeight = groupElementRef.current?.clientHeight ?? 0;
    if (groupHeight > 0) {
      const detailShare = (100 - defaultMasterSize) / 100;
      defaultDetailExpandedPxRef.current = Math.round(groupHeight * detailShare);
      return defaultDetailExpandedPxRef.current;
    }

    return Math.max(collapsedDetailHeaderPx * 6, 280);
  }, [collapsedDetailHeaderPx, defaultMasterSize]);

  const syncCollapsedState = useCallback(
    (collapsed: boolean) => {
      setIsCollapsed(collapsed);
      onDetailCollapsedChange?.(collapsed);
    },
    [onDetailCollapsedChange],
  );

  const collapseToHeader = useCallback(() => {
    const panel = detailRef.current;
    if (!panel) return;

    const currentSize = panel.getSize();
    if (!isPanelCollapsed(currentSize, collapsedDetailHeaderPx)) {
      savedDetailExpandedPxRef.current = currentSize.inPixels;
    }

    panel.resize(collapsedDetailHeaderPx);
    syncCollapsedState(true);
  }, [collapsedDetailHeaderPx, detailRef, syncCollapsedState]);

  const expandFromHeader = useCallback(() => {
    const panel = detailRef.current;
    if (!panel) return;

    const restorePx = savedDetailExpandedPxRef.current ?? resolveDefaultExpandedPx();
    panel.resize(restorePx);
    syncCollapsedState(false);
  }, [detailRef, resolveDefaultExpandedPx, syncCollapsedState]);

  useLayoutEffect(() => {
    const captureDefault = () => {
      const panel = detailRef.current;
      if (!panel) return;

      const size = panel.getSize();
      if (!isPanelCollapsed(size, collapsedDetailHeaderPx)) {
        defaultDetailExpandedPxRef.current = size.inPixels;
        return;
      }

      resolveDefaultExpandedPx();
    };

    if (!initialDetailCollapsed) {
      const frame = requestAnimationFrame(captureDefault);
      return () => cancelAnimationFrame(frame);
    }

    const frame = requestAnimationFrame(() => {
      resolveDefaultExpandedPx();
      detailRef.current?.resize(collapsedDetailHeaderPx);
      setIsCollapsed(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [
    collapsedDetailHeaderPx,
    detailRef,
    initialDetailCollapsed,
    resolveDefaultExpandedPx,
  ]);

  const onToggle = useCallback(() => {
    const panel = detailRef.current;
    if (!panel) return;

    if (isPanelCollapsed(panel.getSize(), collapsedDetailHeaderPx)) {
      expandFromHeader();
      return;
    }

    collapseToHeader();
  }, [collapseToHeader, collapsedDetailHeaderPx, detailRef, expandFromHeader]);

  const handleDetailResize = useCallback(
    (panelSize: PanelSize, _id: string | number | undefined, _prevPanelSize: PanelSize | undefined) => {
      if (!isPanelCollapsed(panelSize, collapsedDetailHeaderPx)) {
        defaultDetailExpandedPxRef.current = panelSize.inPixels;
      }

      const collapsed = isPanelCollapsed(panelSize, collapsedDetailHeaderPx);
      setIsCollapsed((current) => (current === collapsed ? current : collapsed));
    },
    [collapsedDetailHeaderPx],
  );

  return (
    <ResizablePanelGroup
      elementRef={groupElementRef}
      orientation="vertical"
      className={cn("h-full w-full", className)}
    >
      <ResizablePanel defaultSize={defaultMasterSize} minSize={minMasterSize}>
        {masterPanel}
      </ResizablePanel>

      <ResizableHandle className="py-0.5 bg-shell-content border-border border-y-[1px]" withHandle />

      <ResizablePanel
        panelRef={detailRef}
        defaultSize={100 - defaultMasterSize}
        minSize={collapsedDetailHeaderPx}
        onResize={handleDetailResize}
      >
        {detailPanel({ onToggle, isCollapsed })}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

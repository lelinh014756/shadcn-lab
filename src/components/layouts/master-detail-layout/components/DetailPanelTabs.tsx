"use client";

/**
 * DetailPanelTabs
 * ---------------
 * Tabs component dùng trong detail panel của các module.
 * Lifted tabs style + scroll ngang (shell-scrollbar) + gradient fade 2 bên.
 *
 * KHÔNG lưu cache, KHÔNG có nút close.
 * State tab active là useState local, không liên quan router.
 *
 * Layout của từng tab content do chính component content quyết định:
 * - Bảng MRT → tự fill 100% height, không cần padding ngoài.
 * - Form, text, card → tự thêm padding bên trong.
 * - Bất kỳ ReactNode nào khác đều hoạt động.
 *
 * TabsContent render với `overflow-hidden` + `h-full` để content fill đúng
 * chiều cao panel. Content tự quyết có scroll hay không.
 */

import type { LucideIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type DetailTab<T extends string = string> = {
  id: T;
  label: string;
  icon: LucideIcon;
  // Không có noPadding ở đây — padding là trách nhiệm của component content,
  // không phải config của tab. Tab chỉ biết id/label/icon.
};

interface DetailPanelTabsProps<T extends string> {
  tabs: readonly DetailTab<T>[];
  defaultTab: T;
  renderContent: (tabId: T) => React.ReactNode;
  className?: string;
  fadeFrom?: string;
}

export function DetailPanelTabs<T extends string>({
  tabs,
  defaultTab,
  renderContent,
  className,
  fadeFrom = "from-background",
}: DetailPanelTabsProps<T>) {
  const [activeTab, setActiveTab] = useState<T>(defaultTab);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [tabs.length]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as T)}
      className={cn("flex min-h-0 flex-1 flex-col bg-shell-content", className)}
    >
      {/* ===== Tab list với scroll + gradient fade ===== */}
      <div className="relative shrink-0">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8",
            "bg-gradient-to-r via-background/80 to-transparent",
            fadeFrom,
            "transition-opacity duration-150",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8",
            "bg-gradient-to-l via-background/80 to-transparent",
            fadeFrom,
            "transition-opacity duration-150",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />

        <TabsList
          ref={scrollRef}
          className={cn(
            "shell-scrollbar h-auto justify-start rounded-none bg-card p-0 pt-[2px]",
            "w-full overflow-x-auto overflow-y-hidden",
          )}
        >
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <Fragment key={tab.id}>
                {/* Separator — ẩn khi kề bên tab active */}
                {i > 0 &&
                  tabs[i - 1]?.id !== activeTab &&
                  tab.id !== activeTab && (
                    <span
                      aria-hidden
                      className="my-2 h-4 w-px shrink-0 self-center bg-border"
                    />
                  )}

                <TabsTrigger
                  value={tab.id}
                  className={cn(
                    "group/tab relative order-b h-8 flex-none shrink-0 rounded-none px-3",
                    "inline-flex items-center gap-1.5",
                    "bg-transparent! shadow-none!",
                    "data-active:border-border data-active:bg-shell-content!",
                    "data-active:z-10 data-active:-mb-px data-active:rounded-t-sm data-active:rounded-b-none data-active:border-b-0!",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[14px] shrink-0 transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "whitespace-nowrap text-xs transition-colors",
                      isActive
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {tab.label}
                  </span>
                </TabsTrigger>
              </Fragment>
            );
          })}
          <span className="absolute right-0 bottom-0 left-0 border-b"></span>
        </TabsList>
      </div>

      {/* ===== Tab content =====
       * `overflow-hidden` + `h-full`: content fill đúng chiều cao panel.
       * Content tự quyết layout bên trong:
       *   - MRT DataGrid → tự fill h-full, không cần padding ngoài
       *   - Nội dung thông thường → tự thêm padding (p-4, p-6, v.v.)
       *   - Bất kỳ thứ gì khác (form, card, chart, ...) → đều hoạt động
       */}
      <div className="relative min-h-0 flex-1">
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="absolute inset-0 mt-0 overflow-hidden"
          >
            {tab.id === activeTab ? renderContent(tab.id) : null}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

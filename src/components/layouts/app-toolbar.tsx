import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AppToolBarProps = {
  children: ReactNode;
  className?: string;
};

export function AppToolBar({ children, className }: AppToolBarProps) {
  const [isStuck, setIsStuck] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    // Quan sát chính toolbar.
    // Toolbar sticky ở top: 56px (top-14).
    // rootMargin cắt đi 57px từ trên xuống. Khi toolbar dính ở 56px, 1px trên cùng
    // của nó sẽ nằm ngoài vùng quan sát => intersectionRatio < 1.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(entry!.intersectionRatio < 1);
      },
      { rootMargin: "-57px 0px 0px 0px", threshold: [1] },
    );

    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "mb-3 flex flex-wrap @max-5xl/shell-main:flex-nowrap items-center justify-between @max-5xl/shell-main:gap-2 gap-3 transition-all duration-200",
        isStuck
          ? "sticky -top-3 z-48 -mx-3 border-b bg-background/95 px-3 py-1 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur supports-[backdrop-filter]:bg-background/80"
          : "border-b-transparent bg-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Left section: search input + filter controls. */
export function AppToolBarFilters({ children, className }: AppToolBarProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-wrap @max-5xl/shell-main:flex-nowrap items-center @max-5xl/shell-main:gap-2 gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Right section: action buttons. */
export function AppToolBarActions({ children, className }: AppToolBarProps) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      {children}
    </div>
  );
}

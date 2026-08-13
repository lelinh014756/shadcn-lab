import { cn } from "@/lib/utils";

interface TableProgressBarProps extends React.ComponentProps<"div"> {
  visible: boolean;
}

/** Indeterminate loading bar, the analog of MRT's `showProgressBars`. */
export function TableProgressBar({
  visible,
  className,
  ...props
}: TableProgressBarProps) {
  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden bg-primary/20",
        className,
      )}
      {...props}
    >
      <div className="h-full w-1/3 animate-table-progress bg-primary" />
    </div>
  );
}

import React, { memo } from "react";
import { ToggleApp, type ToggleAppProps } from "@/components/toggle";
import { Dot } from "lucide-react";

export const WORK_STATUS_OPTIONS = [
      { value: 1, label: "Đang làm việc", icon: <Dot strokeWidth={8} className="text-green-500" /> },
      { value: 2, label: "Tạm nghỉ", icon: <Dot strokeWidth={8} className="text-yellow-500" /> },
      { value: 3, label: "Đã nghỉ việc", icon: <Dot strokeWidth={8} className="text-rose-500" /> },
    ];

const ToggleWorkStatus = React.forwardRef<
  HTMLDivElement,
  Omit<ToggleAppProps, "options">
>(({ ...props }, ref) => (
  <ToggleApp
    ref={ref}
    spacing={2}
    options={WORK_STATUS_OPTIONS}
    {...props}
  />
));

export default memo(ToggleWorkStatus);
/**
 * AppIcon — wrapper icon dùng chung, port từ `AppHugeIcon` (Payment-DIP-web).
 *
 * Bản gốc chạy trên `@hugeicons/react` + `@hugeicons/core-free-icons` và tra
 * icon theo TÊN dạng chuỗi. Ở đây đổi sang `lucide-react` (đã có sẵn) và nhận
 * thẳng component icon thay vì chuỗi:
 *
 *   - tablecn là registry công khai, mỗi package thêm vào là mỗi package người
 *     dùng `shadcn add` phải kéo theo — không đáng cho vài cái icon.
 *   - Tra theo chuỗi ở bản gốc chỉ để cấu hình icon từ API/JSON. Trong repo này
 *     không có nhu cầu đó, mà lại mất kiểm tra kiểu lúc biên dịch và phải
 *     `console.warn` khi gõ sai tên.
 *
 * Giữ nguyên phần còn lại của API: `size` / `color` / `strokeWidth` /
 * `className` cùng class nền `shrink-0 transition-colors`.
 */

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface AppIconProps extends Omit<React.SVGProps<SVGSVGElement>, "color"> {
  icon: LucideIcon;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function AppIcon({
  icon: Icon,
  size = 24,
  color = "currentColor",
  strokeWidth = 1.5,
  className,
  ...props
}: AppIconProps) {
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={cn("shrink-0 transition-colors duration-200", className)}
      {...props}
    />
  );
}

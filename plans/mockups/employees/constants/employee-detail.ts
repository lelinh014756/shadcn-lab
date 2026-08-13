import { UserRound, Building2, History, FolderOpen } from "lucide-react";

/**
 * Tab layout cho EmployeeDetailPanel (master-detail).
 * Mirror pattern `DETAIL_TABS` của module Products (`src/modules/products/constants/product-detail.ts`).
 */
export const DETAIL_TABS = [
  { id: "info", label: "Chi tiết", icon: UserRound },
  { id: "timeline", label: "Lịch sử thực hiện", icon: History },
  { id: "documents", label: "Tài liệu", icon: FolderOpen },
  { id: "sales", label: "Lịch sử bán hàng", icon: Building2 },
] as const;

export type EmployeeDetailTabId = (typeof DETAIL_TABS)[number]["id"];

export const SALES_TYPES = [
  "Đặt cọc",
  "Ký HĐMB",
  "Thanh toán đợt 1",
  "Thanh toán đợt 2",
  "Thanh toán đợt 3",
  "Bàn giao nhà",
  "Hoàn cọc",
  "Chuyển nhượng",
] as const;

export interface StaffSalesHistory {
  id: number;
  customerName: string;
  productCode: string;
  productName: string;
  transactionType: string;
  amount: number;
  transactionDate: string;
  contractNumber: string;
  status: "completed" | "pending" | "cancelled";
  note: string;
  createdAt: string;
}

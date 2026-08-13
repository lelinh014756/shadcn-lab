export const DOCUMENT_TYPES = [
  "Hợp đồng lao động",
  "Quyết định tuyển dụng",
  "Bằng cấp/Chứng chỉ",
  "CMND/CCCD",
  "Sơ yếu lý lịch",
  "Giấy khám sức khỏe",
  "Ảnh thẻ",
  "Khác",
] as const;

export interface StaffDocument {
  id: number;
  type: string;
  name: string;
  documentNumber: string;
  issuedDate: string;
  issuedBy: string;
  expiryDate: string | null;
  fileUrl: string;
  note: string;
  createdAt: string;
}

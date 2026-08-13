import type { EmployeeLookup } from "./employee.types";

export const organizations: EmployeeLookup[] = [
  { id: 1, name: "Landsoft" },
  { id: 2, name: "Landsoft Miền Bắc" },
  { id: 3, name: "Landsoft Miền Trung" },
];

export const departments: EmployeeLookup[] = [
  { id: 1, name: "Phòng Kinh doanh" },
  { id: 2, name: "Phòng Kế toán" },
  { id: 3, name: "Phòng Hành chính" },
  { id: 4, name: "Phòng Kỹ thuật" },
  { id: 5, name: "Phòng Marketing" },
  { id: 6, name: "Phòng Nhân sự" },
];

export const positions: EmployeeLookup[] = [
  { id: 1, name: "Giám đốc" },
  { id: 2, name: "Trưởng phòng" },
  { id: 3, name: "Phó phòng" },
  { id: 4, name: "Chuyên viên" },
  { id: 5, name: "Nhân viên" },
  { id: 6, name: "Thực tập sinh" },
];

export const bankCodes = [
  "ACB",
  "VCB",
  "BIDV",
  "TCB",
  "MB",
  "VPB",
  "TPB",
  "SHB",
] as const;

export const jobTitlesByDepartment: Record<number, string[]> = {
  1: ["Trưởng phòng Kinh doanh", "Chuyên viên Kinh doanh", "Sales Executive"],
  2: ["Kế toán trưởng", "Kế toán tổng hợp", "Kế toán công nợ"],
  3: ["Trưởng phòng Hành chính", "Nhân viên Hành chính", "Lễ tân"],
  4: ["Kỹ sư phần mềm", "Kỹ sư QA", "DevOps Engineer"],
  5: ["Marketing Manager", "Content Executive", "Digital Marketing"],
  6: ["HR Manager", "Chuyên viên Tuyển dụng", "Chuyên viên C&B"],
};

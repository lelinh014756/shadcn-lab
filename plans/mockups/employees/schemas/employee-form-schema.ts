import dayjs from 'dayjs';
import * as z from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Form Schema — dùng cho EmployeeUpdateForm (create/edit)
// ─────────────────────────────────────────────────────────────────────────────

export const employeeFormSchema = z.object({
  code: z.string().min(1, 'Mã nhân viên không được để trống'),
  fullName: z.string().min(1, 'Họ và tên không được để trống'),
  gender: z.string().optional(),
  dateOfBirth: z.string("Ngày bắt đầu là một chuỗi")
    .min(1, "Vui lòng chọn ngày sinh")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Ngày không hợp lệ",
    }),
  personalPhone: z.string().max(20, 'Số điện thoại không được vượt quá 20 ký tự').optional().or(z.literal('')),
  personalEmail: z.string().email('Email không đúng định dạng'),
  address: z.string().max(500, 'Địa chỉ không được vượt quá 500 ký tự').optional().or(z.literal('')),

  // Identity fields
  idtype: z.string().max(20, 'Loại giấy tờ không được vượt quá 20 ký tự').optional().or(z.literal('')),
  idnumber: z.string().max(30, 'Số giấy tờ không được vượt quá 30 ký tự').optional().or(z.literal('')),
  idissuedDate: z.string().nullable().optional(),
  idissuedPlace: z.string().max(200, 'Nơi cấp không được vượt quá 200 ký tự').optional().or(z.literal('')),

  // Permanent Address (API v2: int ID, replaces string code)
  permanentAddress: z.string().max(500, 'Địa chỉ thường trú không được vượt quá 500 ký tự').optional().or(z.literal('')),
  permanentProvinceId: z.coerce.number().optional(),
  permanentWardId: z.coerce.number().optional(),
  addressFull: z.string().max(500, 'Địa chỉ đầy đủ không được vượt quá 500 ký tự').optional().or(z.literal('')),

  // Contact Address (API v2: new fields)
  contactAddress: z.string().max(500, 'Địa chỉ liên hệ không được vượt quá 500 ký tự').optional().or(z.literal('')),
  contactProvinceId: z.coerce.number().optional(),
  contactWardId: z.coerce.number().optional(),

  // Tax & Banking
  taxNumber: z.string().max(20, 'Mã số thuế không được vượt quá 20 ký tự').optional().or(z.literal('')),
  bankAccount: z.string().max(30, 'Số tài khoản không được vượt quá 30 ký tự').optional().or(z.literal('')),
  bankAccountName: z.string().max(100, 'Tên tài khoản không được vượt quá 100 ký tự').optional().or(z.literal('')),
  bankCode: z.string().max(20, 'Mã ngân hàng không được vượt quá 20 ký tự').optional().or(z.literal('')),

  // Notes
  notes: z.string().max(2000, 'Ghi chú không được vượt quá 2000 ký tự').optional().or(z.literal('')),

  // Organization
  organizationId: z.coerce.number().optional().refine((val) => !!val, { message: 'Vui lòng chọn đơn vị' }),
  departmentId: z.coerce.number().optional(),
  managerId: z.coerce.number().optional(),
  positionId: z.coerce.number().optional(),
  jobTitle: z.string().max(100, 'Chức danh không được vượt quá 100 ký tự').optional().or(z.literal('')),

  workEmail: z.string().email('Email công việc không đúng định dạng').optional().or(z.literal('')),
  workPhone: z.string().max(20, 'SĐT công ty không được vượt quá 20 ký tự').optional().or(z.literal('')),
  userId: z.coerce.number().optional(),

  startDate: z.string().nullable().refine((val) => !val || dayjs(val).isValid(), {
    message: "Ngày không hợp lệ",
  }),
  endDate: z.string().nullable().optional(),
  staffStatusId: z.coerce.number().optional(),
});

export type EmployeeFormSchema = z.infer<typeof employeeFormSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Filter Form Schema — dùng cho Employee Filter Form (filter)
// ─────────────────────────────────────────────────────────────────────────────
export const employeeFilterSchema = z.object({
  organizationId: z.coerce.number().optional(),
  isActive: z.coerce.boolean().nullable().optional(),
  staffStatusId: z.coerce.number().optional(),
  positionId: z.coerce.number().optional(),
  managerId: z.coerce.number().optional(),
  departmentId: z.coerce.number().optional(),
});

export type EmployeeFilterSchema = z.infer<typeof employeeFilterSchema>;
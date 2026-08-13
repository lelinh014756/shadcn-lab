/**
 * Pure helpers cho luồng "Cấp tài khoản" (link/create user cho nhân viên).
 * Không phụ thuộc React — dễ test và tái sử dụng.
 */

import type { SelectOption } from "@/components/forms/select-app";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Trạng thái staff hiện tại — driver logic hiển thị banner + submit label. */
export type StaffState = "empty" | "linked" | "inactive";

/** Form state cho tab "Tạo tài khoản mới". */
export type CreateForm = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleId: string;
  autoGenPassword: boolean;
  forceReset: boolean;
};

// ─── Constants ───────────────────────────────────────────────────────────────

// TODO: thay bằng lookup role thực khi API sẵn sàng.
export const DEMO_ROLES: SelectOption[] = [
  { value: "1", label: "Admin" },
  { value: "2", label: "Quản lý" },
  { value: "3", label: "Trưởng nhóm" },
  { value: "4", label: "Nhân viên" },
];

export const INITIAL_FORM: CreateForm = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  roleId: "4",
  autoGenPassword: true,
  forceReset: true,
};

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Pure functions ──────────────────────────────────────────────────────────

/** Lấy 2 chữ đầu (initials) từ họ tên — cho avatar fallback. */
export function getInitials(fullName?: string | null): string {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Sinh mật khẩu 12 ký tự đảm bảo có upper/lower/digit/special. */
export function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$";
  const pool = upper + lower + digits + special;
  const pick = (src: string) => src[Math.floor(Math.random() * src.length)];
  let pw = pick(upper) + pick(lower) + pick(digits) + pick(special);
  for (let i = 0; i < 8; i++) pw += pick(pool);
  return pw
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Đánh giá độ mạnh mật khẩu (0-4).
 * 0 = trống · 1 = yếu · 2 = TB · 3 = khá · 4 = mạnh.
 */
export function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw) && pw.length >= 12) s++;
  return Math.min(s, 4);
}

/** Validate form tạo user — dùng cho submit disabled state. */
export function isCreateFormValid(form: CreateForm): boolean {
  return (
    form.username.length >= 3 &&
    USERNAME_RE.test(form.username) &&
    EMAIL_RE.test(form.email) &&
    form.password.length >= 8 &&
    form.roleId.trim().length > 0
  );
}

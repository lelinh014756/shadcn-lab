/**
 * Types cho API nhân viên (docs/api/api-staff.md)
 *
 * - ChangeActivateStaffAsync: PATCH /staff/{id}/status — đổi employment status
 * - ChangeAccountStatusAsync: PATCH /staff/{id}/account-status — khoá/mở khoá tài khoản
 */

// ─── Request ──────────────────────────────────────────────────────────────────

/**
 * Body `StaffStatusChangeRequest` cho PATCH /staff/{id}/status.
 *
 * - `staffStatusId`: 1 = Đang làm, 2 = Nghỉ phép, 3 = Nghỉ việc.
 * - `reason`: Bắt buộc khi staffStatusId = 3.
 */
export type StaffStatusChangeRequest = {
  staffStatusId: number;
  reason?: string;
};

// ─── Response ─────────────────────────────────────────────────────────────────

/**
 * Payload `data` trong envelope response của
 * `PATCH /api/v1/staff/{id}/status`.
 *
 * Endpoint không trả dữ liệu (BE spec: `data: null` khi success). Type này
 * đóng vai trò marker giúp `handleApiOK<StaffStatusChangeResponse>()` mô tả
 * đúng ngữ nghĩa "kết quả đổi trạng thái" thay vì literal `null` rời rạc.
 *
 * @example
 * ```json
 * {
 *   "success": true,
 *   "data": null,
 *   "message": "Yêu cầu được xử lý thành công",
 *   "errors": [],
 *   "timestamp": "2026-07-09T16:24:33.5988306+00:00"
 * }
 * ```
 */
/**
 * Marker type cho response của PATCH /staff/{id}/status (data: null).
 */
export type StaffStatusChangeResponse = null;

// ─── Account Status ────────────────────────────────────────────────────────────

/**
 * Body `ChangeAccountStatusRequest` cho PATCH /staff/{id}/account-status.
 *
 * - `isLocked`: true = khoá tài khoản (User.IsActive = false), false = mở khoá.
 */
export type AccountStatusChangeRequest = {
  isLocked: boolean;
};

/**
 * Response data của PATCH /staff/{id}/account-status.
 */
export type AccountStatusChangeResponse = {
  id: number;
  fullName: string;
  isLocked: boolean;
  userId: number;
} | null;

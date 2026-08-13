// ──────────────────────────────────────────────────────────────────────────────
// src/modules/system/employees/hooks/use-employees-query.ts
// ──────────────────────────────────────────────────────────────────────────────
// React Query hooks cho module Employees.
//
// Cấu trúc file (theo thứ tự đọc):
//   1. Imports
//   2. Constants
//   3. Query key factory
//   4. Shared types (local)
//   5. Queries (all)
//   6. Mutations (all)
//
// Convention:
//   - Mọi mutation check `res.success` và `throw` nếu false → react-query
//     đưa vào nhánh `onError` để consumer tự bind toast.
//   - `onSuccess` invalidate `lists()` và `detail(id)` phù hợp.
//   - `MutationOptions` chỉ nhận `onSuccess/onError` — bind toast ở consumer.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CACHE_DURATIONS, LIST_QUERY_DEFAULTS } from "@/lib/query/query-client";
import { accountsServices } from "@/modules/system/accounts/services";

import type { PaginatedResult } from "../../shared/types";
import { EmployeeFormSchema } from "../schemas/employee-form-schema";
import { employeesService } from "../services";
import {
  getStaffActivityLogs,
  type StaffActivityLogQuery,
  type StaffActivityLogResult,
  type StaffLookupParams,
} from "../services/employees-service";
import type { Employee } from "../types/employee";
import type {
  ChangeAccountStatusPayload,
  ChangeStaffStatusPayload,
  EmployeeListParams,
} from "../types/employee-service";

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPLOYEE_STALE_TIME = 1000 * 60 * 5; // 5 minutes

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const employeesKeys = {
  all: ["employees"] as const,
  lists: () => [...employeesKeys.all, "list"] as const,
  list: (params: EmployeeListParams) =>
    [...employeesKeys.lists(), params] as const,
  /** Infinite list dùng key riêng để tránh cache collision với paginated list. */
  infiniteLists: () => [...employeesKeys.all, "infiniteList"] as const,
  infiniteList: (params: EmployeeListParams) =>
    [...employeesKeys.infiniteLists(), params] as const,
  details: () => [...employeesKeys.all, "detail"] as const,
  detail: (id: number | null) => [...employeesKeys.details(), id] as const,
  lookups: () => [...employeesKeys.all, "lookup"] as const,
  lookup: (params: StaffLookupParams) =>
    [...employeesKeys.lookups(), params] as const,
  activityLogs: (staffId: number | null, query?: StaffActivityLogQuery) =>
    [...employeesKeys.all, "activityLogs", staffId, query] as const,
} as const;

// ─── Shared Types (local) ─────────────────────────────────────────────────────

/**
 * Callbacks tuỳ chọn truyền vào các mutation hook. Consumer bind toast /
 * navigation ở đây; không xử lý gì trong hook.
 */
type MutationOptions<TData = void> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
};

export type CreateUserPayload = {
  organizationId: number;
  username: string;
  email: string;
  password: string;
  roleId?: number;
  fullName?: string;
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── Queries ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch danh sách nhân viên có phân trang + filter.
 * Query auto-disable qua `options.enabled` (VD: khi bật infinite scroll mode).
 *
 * @example
 * ```ts
 * const { data, isLoading } = useEmployeesList({ pageIndex: 0, pageSize: 20 });
 * ```
 */
export function useEmployeesList(
  params: EmployeeListParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: employeesKeys.list(params),
    queryFn: () => employeesService.getList(params),
    select: (result: PaginatedResult<Employee>) => ({
      items: result.items,
      totalCount: result.totalCount,
    }),
    enabled: options?.enabled ?? true,
    staleTime: EMPLOYEE_STALE_TIME,
    ...LIST_QUERY_DEFAULTS,
  });
}

/**
 * Fetch chi tiết nhân viên theo ID. Disabled khi `id == null`.
 * Dùng cho detail panel / detail sheet — source of truth cho employee sau
 * khi mutation invalidate `employeesKeys.detail(id)`.
 */
export function useEmployeeDetail(id: number | null) {
  return useQuery({
    queryKey: employeesKeys.detail(id),
    queryFn: () =>
      id != null ? employeesService.getById(id) : Promise.resolve(null),
    enabled: id != null,
    staleTime: EMPLOYEE_STALE_TIME,
  });
}

/**
 * Lookup nhân viên gọn cho combobox (id + code + name + org/dept…).
 * Filter theo `organizationId`, `departmentId`, `keyword`.
 */
export function useEmployeeLookup(
  params: StaffLookupParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: employeesKeys.lookup(params),
    queryFn: () => employeesService.staffLookup(params),
    staleTime: EMPLOYEE_STALE_TIME,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Fetch hồ sơ nhân viên của user đang đăng nhập (`GET /staff/me`).
 * Dùng cho trang "My Profile" / greeting header / autofill form.
 */
export function useMyProfile() {
  return useQuery({
    queryKey: [...employeesKeys.all, "myProfile"],
    queryFn: employeesService.getMyProfile,
    staleTime: EMPLOYEE_STALE_TIME,
  });
}

/**
 * Fetch activity logs của một nhân viên (`GET /staff/{id}/activity-logs`).
 * Disabled khi `staffId` null hoặc <= 0.
 */
export function useStaffActivityLogs(
  staffId: number | null,
  params?: { pageNumber?: number; pageSize?: number },
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && staffId != null && staffId > 0;
  const query: StaffActivityLogQuery = {
    ...params,
    entityId: staffId ? staffId.toString() : undefined,
  };

  return useQuery<StaffActivityLogResult>({
    queryKey: employeesKeys.activityLogs(staffId, query),
    queryFn: () => getStaffActivityLogs(staffId!, query),
    enabled,
    staleTime: CACHE_DURATIONS.USER_DATA.staleTime,
    ...LIST_QUERY_DEFAULTS,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Mutations ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Tạo nhân viên mới (`POST /staff`). Invalidate `lists()` khi success.
 *
 * @example
 * ```ts
 * const { mutate } = useCreateEmployee();
 * mutate({ code: 'NV001', fullName: 'John', ... });
 * ```
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EmployeeFormSchema) => {
      const res = await employeesService.create(payload);
      if (!res.success) {
        throw new Error(
          res.errors?.[0]?.message ?? res.message ?? "Lỗi tạo nhân viên",
        );
      }
      return res;
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      return resp;
    },
  });
}

/**
 * Cập nhật nhân viên (`PUT /staff/{id}`). Invalidate `lists()` + `detail(id)`.
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: EmployeeFormSchema;
    }) => {
      const res = await employeesService.update(id, payload);
      if (!res.success) {
        throw new Error(
          res.errors?.[0]?.message ??
          res.message ??
          "Lỗi cập nhật nhân viên",
        );
      }
      return res;
    },
    onSuccess: (resp, variables) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: employeesKeys.detail(variables.id),
      });
      return resp;
    },
  });
}

/**
 * Khoá / mở khoá tài khoản đăng nhập của nhân viên
 * (`PATCH /staff/{id}/account-status`, payload `{ isLocked: bool }`).
 * Khác `useChangeStaffStatus` — chỉ tác động lên account, không đổi
 * employment status.
 */
export function useChangeAccountStatus(options?: {
  onSuccess?: (
    resp: unknown,
    vars: { id: number; payload: ChangeAccountStatusPayload },
  ) => void;
  onError?: (
    err: unknown,
    vars: { id: number; payload: ChangeAccountStatusPayload },
  ) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: ChangeAccountStatusPayload;
    }) => {
      const res = await employeesService.changeAccountStatus(id, payload);
      if (!res.success) {
        throw new Error(
          res.errors?.[0]?.message ??
          res.message ??
          "Không thể thay đổi trạng thái tài khoản nhân viên",
        );
      }
      return res;
    },
    onSuccess: (resp, vars) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(vars.id) });
      options?.onSuccess?.(resp, vars);
    },
    onError: (err, vars) => options?.onError?.(err, vars),
  });
}

/**
 * Thay đổi employment status (tình trạng làm việc) — gọi
 * `PATCH /staff/{id}/status` với `{ staffStatusId, reason? }`.
 *
 * Status: `1` = Đang làm · `2` = Nghỉ phép · `3` = Nghỉ việc.
 * `reason` bắt buộc khi `staffStatusId = 3`.
 */
export function useChangeStaffStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: ChangeStaffStatusPayload;
    }) => {
      const res = await employeesService.changeStaffStatus(id, payload);
      if (!res.success) {
        throw new Error(
          res.errors?.[0]?.message ??
          res.message ??
          "Không thể thay đổi tình trạng làm việc của nhân viên",
        );
      }
      return res;
    },
    onSuccess: (resp, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(id) });
      return resp;
    },
  });
}

/**
 * Xóa nhân viên (`DELETE /staff/{id}` — tombstone).
 * Invalidate `lists()` + `detail(id)`.
 */
export function useDeleteStaff(options?: {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await employeesService.deleteStaff(id);
      if (!res.success) {
        throw new Error(
          res.errors?.[0]?.message ?? res.message ?? "Không thể xóa nhân viên",
        );
      }
      return res;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(id) });
      options?.onSuccess?.();
    },
    onError: (err) => options?.onError?.(err),
  });
}

/**
 * Import nhân viên từ file Excel (`POST /staff/import`, multipart).
 *
 * @example
 * ```ts
 * const { mutate } = useImportEmployees();
 * const file = inputRef.current?.files?.[0];
 * if (file) mutate(file);
 * ```
 */
export function useImportEmployees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesService.importFromFile,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      return result;
    },
  });
}

/**
 * Liên kết một user account đã có sẵn với nhân viên
 * (`POST /staff/{staffId}/link-user`, body `{ userId }`).
 */
export function useLinkUserToEmployee(options?: MutationOptions) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      staffId,
      userId,
    }: {
      staffId: number;
      userId: number;
    }) => {
      const res = await employeesService.linkUser(staffId, userId);
      if (!res.success) {
        throw new Error(
          res.errors?.[0]?.message ??
          res.message ??
          "Không thể liên kết tài khoản",
        );
      }
      return res;
    },
    onSuccess: (_, { staffId }) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(staffId) });
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

/**
 * Huỷ liên kết user account khỏi nhân viên
 * (`DELETE /staff/{staffId}/link-user`). User không bị xoá — chỉ mất liên kết.
 */
export function useUnlinkUser(options?: MutationOptions) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffId: number) => {
      const res = await employeesService.unlinkUser(staffId);
      if (!res.success) {
        throw new Error(
          res.errors?.[0]?.message ??
          res.message ??
          "Không thể hủy liên kết tài khoản",
        );
      }
      return res;
    },
    onSuccess: (_, staffId) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(staffId) });
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

/**
 * Tạo user account mới rồi tự động liên kết với nhân viên.
 * 2-step: `POST /users` → `POST /staff/{staffId}/link-user`.
 * Nếu step 2 fail, user đã tạo vẫn tồn tại (BE không rollback) — caller
 * cần xử lý cleanup nếu cần.
 */
export function useCreateUser(options?: MutationOptions) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      staffId,
      payload,
    }: {
      staffId: number;
      payload: CreateUserPayload;
    }) => {
      const newUser = await accountsServices.create({
        username: payload.username,
        email: payload.email,
        displayName: payload.fullName ?? null,
        roleId: payload.roleId ?? null,
        organizationId: payload.organizationId,
        password: payload.password,
      });
      const linkRes = await employeesService.linkUser(staffId, newUser.id);
      if (!linkRes.success) {
        throw new Error(
          linkRes.errors?.[0]?.message ??
          linkRes.message ??
          "Không thể liên kết tài khoản",
        );
      }
      return newUser;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeesKeys.detail(variables.staffId),
      });
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

/**
 * Tải file template Excel để import nhân viên (`GET /staff/import-template`).
 * Trigger bằng `mutation.mutate()` — không cần params.
 *
 * @example
 * ```ts
 * const { mutate: download } = useDownloadImportTemplate();
 * <button onClick={() => download()}>Tải template</button>
 * ```
 */
export function useDownloadImportTemplate() {
  return useMutation({
    mutationFn: employeesService.downloadImportTemplate,
  });
}

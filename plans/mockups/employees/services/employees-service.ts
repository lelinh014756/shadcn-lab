// ─────────────────────────────────────────────────────────────────────────────
// src/modules/employees/services/employees.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure function approach: stateless API adapter

import axiosClient from "@/lib/api/axios";
import { handleApiOK, handleApiError, type ApiResponse } from "@/lib/api/handle-api";
import {
  downloadApiFile,
  formatImportErrorMessage,
  postApiFormData,
} from "@/lib/api/blob-download";
import {
  readStringField,
  readNumberField,
  readRecord,
  readPagedList,
} from "@/lib/api/normalize-paged-list";
import { extractApiEntity } from "@/lib/api/api-envelope";
import {
  buildFilterBody,
  toPaginatedResult,
  readCreatedId,
} from "../../shared/api-helpers";
import type { StaffImportResult } from "../types/staff-import";
import type { StaffStatusChangeResponse, AccountStatusChangeResponse } from "../types/employee-query";
import type { Employee, StaffLookup } from "../types/employee";
import type {
  EmployeeListParams,
  ChangeAccountStatusPayload,
  ChangeStaffStatusPayload,
} from "../types/employee-service";
import type { PaginatedResult } from "../../shared/types";
import type { ActivityLogListPage } from "@/modules/activity-log/types/activity-log";
import { EmployeeFormSchema } from "../schemas/employee-form-schema";
import dayjs from "dayjs";
import { DATE_REQUEST_FORMAT } from "@/shared/constants/format";

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE = "/staff";

const ERRORS = {
  LIST: "Không thể tải danh sách nhân viên",
  GET_BY_ID: "Không thể tải chi tiết nhân viên",
  CREATE: "Không thể tạo nhân viên",
  UPDATE: "Không thể cập nhật nhân viên",
  CHANGE_ACCOUNT_STATUS: "Không thể thay đổi trạng thái tài khoản nhân viên",
  CHANGE_STAFF_STATUS: "Không thể thay đổi tình trạng làm việc của nhân viên",
  DELETE: "Không thể xóa nhân viên",
  LINK_USER: "Không thể liên kết tài khoản",
  UNLINK_USER: "Không thể hủy liên kết tài khoản",
  GET_PROFILE: "Không thể tải thông tin cá nhân",
  IMPORT: "Không thể import nhân viên",
  LOOKUP: "Không thể tải danh sách nhân viên",
} as const;

// ─── Helpers (tách riêng dễ test) ─────────────────────────────────────────────

function normalizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.charAt(0).toLowerCase() + key.slice(1),
      value,
    ]),
  );
}

function readStr(row: Record<string, unknown>, key: string): string | null {
  const val = row[key];
  return val != null ? String(val) : null;
}

function readNum(row: Record<string, unknown>, key: string): number | null {
  const val = row[key];
  return val != null ? Number(val) : null;
}

function readBool(
  row: Record<string, unknown>,
  key: string,
  fallback = false,
): boolean {
  const val = row[key];
  return val != null ? Boolean(val) : fallback;
}

function mapRow(raw: Record<string, unknown>): Employee {
  const row = normalizeKeys(raw);
  const now = new Date().toISOString();

  return {
    id: readNumberField(row, "id", "id"),
    code: readStringField(row, "code", "code"),
    fullName: readStringField(row, "fullName", "fullName"),
    workEmail: readStr(row, "workEmail") ?? readStr(row, "email"),
    departmentId: readNum(row, "departmentId"),
    departmentName: readStr(row, "departmentName"),
    organizationId: readNum(row, "organizationId"),
    organizationName: readStr(row, "organizationName"),
    userId: readNum(row, "userId"),
    isActive: readBool(row, "isActive", true),
    gender: readStr(row, "gender"),
    dateOfBirth: readStr(row, "dateOfBirth"),
    personalEmail: readStr(row, "personalEmail"),
    personalPhone: readStr(row, "personalPhone"),
    address: readStr(row, "address"),
    idtype: readStr(row, "idtype"),
    idnumber: readStr(row, "idnumber"),
    idissuedDate: readStr(row, "idissuedDate"),
    idissuedPlace: readStr(row, "idissuedPlace"),
    permanentAddress: readStr(row, "permanentAddress"),
    // API v2: int ID instead of string code
    permanentWardId: readNum(row, "permanentWardId"),
    permanentProvinceId: readNum(row, "permanentProvinceId"),
    addressFull: readStr(row, "addressFull"),
    // API v2: Contact address fields
    contactAddress: readStr(row, "contactAddress"),
    contactWardId: readNum(row, "contactWardId"),
    contactProvinceId: readNum(row, "contactProvinceId"),
    positionId: readNum(row, "positionId"),
    positionName: readStr(row, "positionName"),
    jobTitle: readStr(row, "jobTitle"),
    workPhone: readStr(row, "workPhone"),
    startDate: readStr(row, "startDate"),
    endDate: readStr(row, "endDate"),
    deactivateEffectiveDate: readStr(row, "deactivateEffectiveDate"),
    staffStatusId: Number(row.staffStatusId ?? 1),
    managerId: readNum(row, "managerId"),
    managerName: readStr(row, "managerName"),
    taxNumber: readStr(row, "taxNumber"),
    bankAccount: readStr(row, "bankAccount"),
    bankAccountName: readStr(row, "bankAccountName"),
    bankCode: readStr(row, "bankCode"),
    userName: readStr(row, "userName"),
    hasLinkedUser: readBool(row, "hasLinkedUser", row.userId != null),
    notes: readStr(row, "notes"),
    createdAt: readStr(row, "createdAt") ?? now,
    createdBy: row.createdBy != null ? Number(row.createdBy) : null,
    createdByName: readStr(row, "createdByName") ?? "",
    updatedAt: readStr(row, "updatedAt") ?? null,
    updatedBy: row.updatedBy != null ? Number(row.updatedBy) : null,
    updatedByName: readStr(row, "updatedByName") ?? "",
  };
}

// ─── Service Functions (Pure, Stateless) ──────────────────────────────────────

export async function getList(
  params: EmployeeListParams,
): Promise<PaginatedResult<Employee>> {
  try {
    const payload = { ...params };

    const response = await axiosClient.post(`${BASE}/search`, payload);
    const res = handleApiOK<unknown>(response);
    if (!res.success || res.data == null)
      throw new Error(res.errors?.[0]?.message ?? res.message ?? ERRORS.LIST);

    return toPaginatedResult(res.data, mapRow, params);
  } catch (error) {
    const apiErr = handleApiError(error);
    throw new Error(apiErr.errors?.[0]?.message ?? apiErr.message ?? ERRORS.LIST);
  }
}

export async function getById(id: number): Promise<Employee | null> {
  try {
    const response = await axiosClient.get(`${BASE}/${encodeURIComponent(String(id))}`);
    const res = handleApiOK<unknown>(response);

    if (!res.success) {
      throw new Error(res.errors?.[0]?.message ?? res.message ?? ERRORS.GET_BY_ID);
    }

    if (res.data == null) return null;
    const raw = readRecord(extractApiEntity(res.data) ?? res.data);
    return raw ? mapRow(raw) : null;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    const apiErr = handleApiError(error);
    throw new Error(apiErr.errors?.[0]?.message ?? apiErr.message ?? ERRORS.GET_BY_ID);
  }
}

export async function create(
  payload: EmployeeFormSchema,
): Promise<ApiResponse<any>> {
  try {
    const requestPayload = {
      ...payload,
      gender: payload.gender ?? null,
      dateOfBirth: payload.dateOfBirth
        ? dayjs(payload.dateOfBirth).format(DATE_REQUEST_FORMAT)
        : null,
      address: payload.address ?? null,
      departmentId: payload.departmentId ?? null,
      organizationId: payload.organizationId,
      positionId: payload.positionId ?? null,
      managerId: payload.managerId ?? null,
      jobTitle: payload.jobTitle ?? null,
      workEmail: payload.workEmail ?? null,
      workPhone: payload.workPhone ?? null,
      startDate: payload.startDate
        ? dayjs(payload.startDate).format(DATE_REQUEST_FORMAT)
        : null,
      endDate: payload.endDate
        ? dayjs(payload.endDate).format(DATE_REQUEST_FORMAT)
        : null,
      idissuedDate: payload.idissuedDate
        ? dayjs(payload.idissuedDate).format(DATE_REQUEST_FORMAT)
        : null,
      staffStatusId: payload.staffStatusId ?? 1,
      // API v2: int ID fields for address
      permanentProvinceId: payload.permanentProvinceId ?? null,
      permanentWardId: payload.permanentWardId ?? null,
      // API v2: Contact address fields
      contactProvinceId: payload.contactProvinceId ?? null,
      contactWardId: payload.contactWardId ?? null,
    };
    const response = await axiosClient.post(BASE, requestPayload);
    return handleApiOK(response);
  } catch (error) {
    return handleApiError(error) as ApiResponse<any>;
  }
}

export async function update(
  id: number,
  payload: EmployeeFormSchema,
): Promise<ApiResponse<any>> {
  try {
    const requestPayload = {
      ...payload,
      gender: payload.gender ?? null,
      dateOfBirth: payload.dateOfBirth
        ? dayjs(payload.dateOfBirth).format(DATE_REQUEST_FORMAT)
        : null,
      address: payload.address ?? null,
      departmentId: payload.departmentId ?? null,
      organizationId: payload.organizationId,
      positionId: payload.positionId ?? null,
      managerId: payload.managerId ?? null,
      jobTitle: payload.jobTitle ?? null,
      workEmail: payload.workEmail ?? null,
      workPhone: payload.workPhone ?? null,
      startDate: payload.startDate
        ? dayjs(payload.startDate).format(DATE_REQUEST_FORMAT)
        : null,
      endDate: payload.endDate
        ? dayjs(payload.endDate).format(DATE_REQUEST_FORMAT)
        : null,
      idissuedDate: payload.idissuedDate
        ? dayjs(payload.idissuedDate).format(DATE_REQUEST_FORMAT)
        : null,
      staffStatusId: payload.staffStatusId ?? 1,
      // API v2: int ID fields for address
      permanentProvinceId: payload.permanentProvinceId ?? null,
      permanentWardId: payload.permanentWardId ?? null,
      // API v2: Contact address fields
      contactProvinceId: payload.contactProvinceId ?? null,
      contactWardId: payload.contactWardId ?? null,
    };
    const response = await axiosClient.put(
      `${BASE}/${encodeURIComponent(String(id))}`,
      requestPayload,
    );
    return handleApiOK(response);
  } catch (error) {
    return handleApiError(error) as ApiResponse<any>;
  }
}

/**
 * `PATCH /staff/{id}/account-status` — ChangeAccountStatusAsync.
 *
 * Khoá hoặc mở khoá tài khoản đăng nhập của nhân viên.
 * `isLocked = true` → khoá (User.IsActive = false)
 * `isLocked = false` → mở khoá (User.IsActive = true)
 */
export async function changeAccountStatus(
  id: number,
  payload: ChangeAccountStatusPayload,
): Promise<ApiResponse<AccountStatusChangeResponse>> {
  try {
    const response = await axiosClient.patch(
      `${BASE}/${encodeURIComponent(String(id))}/account-status`,
      payload,
    );
    return handleApiOK<AccountStatusChangeResponse>(response);
  } catch (error) {
    return handleApiError(error) as ApiResponse<AccountStatusChangeResponse>;
  }
}

/**
 * `PATCH /staff/{id}/status` — ChangeActivateStaffAsync.
 *
 * Thay đổi employment status (StaffStatusId) của nhân viên.
 * staffStatusId: 1 = Đang làm, 2 = Nghỉ phép, 3 = Nghỉ việc (cần reason)
 */
export async function changeStaffStatus(
  id: number,
  payload: ChangeStaffStatusPayload,
): Promise<ApiResponse<StaffStatusChangeResponse>> {
  try {
    const response = await axiosClient.patch(
      `${BASE}/${encodeURIComponent(String(id))}/status`,
      payload,
    );
    return handleApiOK<StaffStatusChangeResponse>(response);
  } catch (error) {
    return handleApiError(error) as ApiResponse<StaffStatusChangeResponse>;
  }
}

/**
 * `DELETE /staff/{id}` — DeleteStaffAsync.
 *
 * Xóa nhân viên (tombstone: IsDeleted=1).
 */
export async function deleteStaff(
  id: number,
): Promise<ApiResponse<null>> {
  try {
    const response = await axiosClient.delete(
      `${BASE}/${encodeURIComponent(String(id))}`,
    );
    return handleApiOK<null>(response);
  } catch (error) {
    return handleApiError(error) as ApiResponse<null>;
  }
}

export async function downloadImportTemplate(): Promise<void> {
  await downloadApiFile(`${BASE}/import-template`, "staff_import_template.xlsx");
}

export async function linkUser(
  id: number,
  userId: number,
): Promise<ApiResponse<null>> {
  try {
    const response = await axiosClient.post(
      `${BASE}/${encodeURIComponent(String(id))}/link-user`,
      { userId },
    );
    return handleApiOK<null>(response);
  } catch (error) {
    return handleApiError(error) as ApiResponse<null>;
  }
}

export async function unlinkUser(id: number): Promise<ApiResponse<null>> {
  try {
    const response = await axiosClient.post(
      `${BASE}/${encodeURIComponent(String(id))}/unlink-user`,
      {},
    );
    return handleApiOK<null>(response);
  } catch (error) {
    return handleApiError(error) as ApiResponse<null>;
  }
}

export async function getMyProfile(): Promise<Employee> {
  try {
    const response = await axiosClient.get(`${BASE}/me`);
    const res = handleApiOK<unknown>(response);
    if (!res.success || res.data == null)
      throw new Error(res.errors?.[0]?.message ?? res.message ?? ERRORS.GET_PROFILE);

    const raw = readRecord(extractApiEntity(res.data) ?? res.data);
    if (!raw) throw new Error("Không thể đọc dữ liệu");
    return mapRow(raw);
  } catch (error) {
    const apiErr = handleApiError(error);
    throw new Error(apiErr.errors?.[0]?.message ?? apiErr.message ?? ERRORS.GET_PROFILE);
  }
}

export type StaffLookupParams = {
  organizationId?: number | null;
  departmentId?: number | null;
  keyword?: string | null;
  /** Client-side filter: exclude these IDs from results (e.g., current employee in edit mode) */
  excludeIds?: number[];
};

function mapLookupRow(row: Record<string, unknown>): StaffLookup {
  return {
    id: readNumberField(row, "id", "Id"),
    code: readStringField(row, "code", "Code"),
    name: readStringField(row, "fullName", "FullName") ?? readStringField(row, "name", "Name") ?? "",
    positionName: readStr(row, "positionName") ?? readStr(row, "PositionName") ?? null,
    organizationName: readStr(row, "organizationName") ?? readStr(row, "OrganizationName") ?? null,
    departmentName: readStr(row, "departmentName") ?? readStr(row, "DepartmentName") ?? null,
    roleName: readStr(row, "roleName") ?? readStr(row, "RoleName") ?? null,
  };
}

export async function staffLookup(
  params: StaffLookupParams,
): Promise<StaffLookup[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params.organizationId != null)
      queryParams.set("organizationId", String(params.organizationId));
    if (params.departmentId != null)
      queryParams.set("departmentId", String(params.departmentId));
    if (params.keyword)
      queryParams.set("keyword", params.keyword);
    const query = queryParams.toString();

    const response = await axiosClient.get(
      `${BASE}/lookup${query ? `?${query}` : ""}`,
    );
    const res = handleApiOK<unknown>(response);

    if (!res.success || res.data == null) return [];

    const list = Array.isArray(res.data)
      ? res.data
      : ((res.data as Record<string, unknown>).items ?? []);
    let results = (list as Record<string, unknown>[]).map(mapLookupRow);

    if (params.excludeIds?.length) {
      const excludeSet = new Set(params.excludeIds);
      results = results.filter((r) => !excludeSet.has(r.id));
    }

    return results;
  } catch (error) {
    return [];
  }
}

export async function importFromFile(file: File): Promise<StaffImportResult> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const res = await postApiFormData<unknown>(`${BASE}/import`, formData);
  if (!res.success)
    throw new Error(formatImportErrorMessage(res, ERRORS.IMPORT));

  const raw = readRecord(extractApiEntity(res.data) ?? res.data);
  if (!raw) {
    return {
      message: "Import thành công",
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
    };
  }

  return {
    message:
      readStringField(raw, "message", "Message") || "Import thành công",
    totalRows: readNumberField(raw, "totalRows", "TotalRows"),
    successCount: readNumberField(raw, "successCount", "SuccessCount"),
    errorCount: readNumberField(raw, "errorCount", "ErrorCount"),
  };
}

// ─── Activity Log ──────────────────────────────────────────────────────────────

export type StaffActivityLogQuery = {
  pageNumber?: number;
  pageSize?: number;
  actionCode?: string;
  resourceCode?: string;
  entityId?: string;
  userId?: number;
  ipAddress?: string;
  fromDate?: string;
  toDate?: string;
  searchKeyword?: string;
  sortBy?: string;
  sortOrder?: string;
};

export type StaffActivityLogResult =
  | { ok: true; data: ActivityLogListPage }
  | { ok: false; error: string; httpCode?: string };

function mapActivityLogEntry(row: Record<string, unknown>) {
  return {
    id: readNumberField(row, "id", "Id") ?? 0,
    actionCode: readStringField(row, "actionCode", "ActionCode") ?? "",
    actionName: readStringField(row, "actionName", "ActionName") ?? "",
    resourceCode: readStringField(row, "resourceCode", "ResourceCode") ?? "",
    resourceName: readStringField(row, "resourceName", "ResourceName") ?? "",
    entityId: readStringField(row, "entityId", "EntityId") ?? "",
    message: readStringField(row, "message", "Message") ?? "",
    userId: readNumberField(row, "userId", "UserId") ?? 0,
    userName: readStringField(row, "userName", "UserName") ?? "",
    ipAddress: readStringField(row, "ipAddress", "IpAddress") ?? "",
    userAgent: readStringField(row, "userAgent", "UserAgent") ?? "",
    extraData: readStringField(row, "extraData", "ExtraData"),
    createdAt: readStringField(row, "createdAt", "CreatedAt") ?? "",
  };
}

function normalizeActivityLogListPage(
  data: unknown,
  query?: StaffActivityLogQuery,
): ActivityLogListPage {
  return readPagedList(data, mapActivityLogEntry, {
    pageNumber: query?.pageNumber ?? 1,
    pageSize: query?.pageSize ?? 20,
  });
}

export async function getStaffActivityLogs(
  staffId: number,
  query?: StaffActivityLogQuery,
): Promise<StaffActivityLogResult> {
  try {
    const params = new URLSearchParams();
    if (query?.pageNumber != null) params.set("pageNumber", String(query.pageNumber));
    if (query?.pageSize != null) params.set("pageSize", String(query.pageSize));
    if (query?.actionCode) params.set("actionCode", query.actionCode);
    if (query?.resourceCode) params.set("resourceCode", query.resourceCode);
    if (query?.entityId) params.set("entityId", query.entityId);
    if (query?.userId != null) params.set("userId", String(query.userId));
    if (query?.ipAddress) params.set("ipAddress", query.ipAddress);
    if (query?.fromDate) params.set("fromDate", query.fromDate);
    if (query?.toDate) params.set("toDate", query.toDate);
    if (query?.searchKeyword) params.set("searchKeyword", query.searchKeyword);
    if (query?.sortBy) params.set("sortBy", query.sortBy);
    if (query?.sortOrder) params.set("sortOrder", query.sortOrder);

    const qs = params.toString();
    const path = `${BASE}/${encodeURIComponent(String(staffId))}/activity-logs${qs ? `?${qs}` : ""}`;
    const response = await axiosClient.get(path);
    const res = handleApiOK<unknown>(response);
    if (!res.success || res.data == null) {
      return { ok: false, error: res.errors?.[0]?.message ?? "Lỗi tải log" };
    }
    return { ok: true, data: normalizeActivityLogListPage(res.data, query) };
  } catch (error) {
    const apiErr = handleApiError(error);
    return { ok: false, error: apiErr.errors?.[0]?.message ?? "Lỗi tải log" };
  }
}

// ─── Service Namespace ────────────────────────────────────────────────────────
// Export object để dùng như `employeesService.list()` nếu prefer.
// Hoặc import functions trực tiếp như `import { getListEmployees }`.

export const employeesService = {
  getList,
  getById,
  create,
  update,
  changeAccountStatus,
  changeStaffStatus,
  deleteStaff,
  downloadImportTemplate,
  linkUser,
  unlinkUser,
  getMyProfile,
  importFromFile,
  staffLookup,
  getStaffActivityLogs,
} as const;

// Type inference cho testing
export type EmployeesService = typeof employeesService;
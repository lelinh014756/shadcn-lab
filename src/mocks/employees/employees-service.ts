/**
 * Mock employees service — the data source for the reference demo that mirrors
 * the Material React Table screen. Supports both the paginated and the infinite
 * flows so the settings-sheet toggle has something real to switch between.
 */

import { simulateLatency } from "@/lib/mock/mock-latency";

import type {
  Employee,
  EmployeeListParams,
  EmployeeListResult,
} from "./employee.types";
import { employeesStore, generateEmployee } from "./employees.mock";

function matchesFilters(employee: Employee, params: EmployeeListParams) {
  const keyword = params.searchKeyword?.trim().toLowerCase();
  if (keyword) {
    const haystack = [
      employee.code,
      employee.fullName,
      employee.workEmail,
      employee.personalEmail,
      employee.personalPhone,
      employee.workPhone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(keyword)) return false;
  }

  if (
    params.organizationId != null &&
    employee.organizationId !== params.organizationId
  ) {
    return false;
  }
  if (
    params.departmentId != null &&
    employee.departmentId !== params.departmentId
  ) {
    return false;
  }
  if (params.positionId != null && employee.positionId !== params.positionId) {
    return false;
  }
  if (params.managerId != null && employee.managerId !== params.managerId) {
    return false;
  }
  if (
    params.staffStatusId != null &&
    employee.staffStatusId !== params.staffStatusId
  ) {
    return false;
  }
  if (params.isActive != null && employee.isActive !== params.isActive) {
    return false;
  }

  return true;
}

export async function getEmployees(
  params: EmployeeListParams,
): Promise<EmployeeListResult> {
  await simulateLatency();

  const filtered = employeesStore
    .getAll()
    .filter((employee) => matchesFilters(employee, params));

  const offset = Math.max(0, (params.pageNumber - 1) * params.pageSize);

  return {
    items: filtered.slice(offset, offset + params.pageSize),
    totalCount: filtered.length,
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  };
}

export async function getEmployeeById(id: number): Promise<Employee | null> {
  await simulateLatency(80);
  return employeesStore.getById(String(id)) ?? null;
}

export async function createEmployee(
  input: Partial<Employee>,
): Promise<Employee> {
  await simulateLatency();

  const nextId =
    employeesStore.getAll().reduce((max, row) => Math.max(max, row.id), 0) + 1;
  const employee: Employee = {
    ...generateEmployee(nextId - 1),
    ...input,
    id: nextId,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };

  employeesStore.insert([employee], "start");
  return employee;
}

export async function updateEmployee(
  id: number,
  patch: Partial<Employee>,
): Promise<Employee | null> {
  await simulateLatency();

  return (
    employeesStore.update(String(id), {
      ...patch,
      updatedAt: new Date().toISOString(),
      updatedByName: "Admin",
    }) ?? null
  );
}

export async function changeEmployeeAccountStatus(
  id: number,
  isLocked: boolean,
): Promise<Employee | null> {
  return updateEmployee(id, {
    isActive: !isLocked,
    staffStatusId: isLocked ? 3 : 1,
  });
}

export async function deleteEmployee(id: number): Promise<void> {
  await simulateLatency();
  employeesStore.remove([String(id)]);
}

// ──────────────────────────────────────────────────────────────────────────────
// src/modules/employees/services/index.ts
// ──────────────────────────────────────────────────────────────────────────────
// Service entry point: decide API vs Mock at build-time or runtime

import { employeesService } from "./employees-service";
import { mockEmployeesService } from "./employees-service-mock";
import { APP_USE_MOCK } from "@/shared/config";

// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * Select implementation based on environment.
 * No singleton wrapper needed — just export the right object.
 *
 * Before (OOP):
 *   const service = new EmployeesApiAdapter();   // ceremony
 *   const mockService = new EmployeesMockAdapter();
 *
 * Now (FP):
 *   const service = employeesService;  // clean, direct
 */
export const employeesServices = APP_USE_MOCK ? mockEmployeesService : employeesService;

// Type inference
export type EmployeesServices = typeof employeesServices;

// ─── Legacy: Support both old class-based imports & new FP imports ────────────
// (transition period)

export { employeesService, type EmployeesService } from "./employees-service";
export { mockEmployeesService, type MockEmployeesService } from "./employees-service-mock";

// ─── Named exports for direct function calls ─────────────────────────────────
// Useful if prefer: `import { listEmployees, createEmployee } from './services'`
// Instead of: `import { employees } from './services'` then `employees.list(...)`
export type Employee = {
  // Core
  id: number;
  code: string;
  fullName: string;
  workEmail: string | null;
  departmentId: number | null;
  departmentName: string | null;
  organizationId: number | null;
  organizationName: string | null;
  userId: number | null;
  isActive: boolean;

  // Personal
  gender: string | null;
  dateOfBirth: string | null;
  personalEmail: string | null;
  personalPhone: string | null;
  address: string | null;

  // Identity
  idtype: string | null;
  idnumber: string | null;
  idissuedDate: string | null;
  idissuedPlace: string | null;

  // Permanent Address (API v2: int ID instead of string code)
  permanentAddress: string | null;
  permanentWardId: number | null;
  permanentProvinceId: number | null;
  addressFull: string | null;

  // Contact Address (API v2: new fields)
  contactAddress: string | null;
  contactWardId: number | null;
  contactProvinceId: number | null;

  // Work
  positionId: number | null;
  positionName: string | null;
  jobTitle: string | null;
  workPhone: string | null;
  startDate: string | null;
  endDate: string | null;
  deactivateEffectiveDate: string | null;
  staffStatusId: number;
  managerId: number | null;
  managerName: string | null;

  // Banking / Tax
  taxNumber: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
  bankCode: string | null;

  // Account link
  userName: string | null;
  hasLinkedUser: boolean;

  // Notes
  notes: string | null;

  // Audit
  createdAt: string;
  createdBy: number | null;
  createdByName: string;
  updatedAt: string | null;
  updatedBy: number | null;
  updatedByName: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Filter Params
// ─────────────────────────────────────────────────────────────────────────────
export interface FilterParams {
  isActive?: string | string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookup (ComboBox)
// ─────────────────────────────────────────────────────────────────────────────
export type StaffLookup = {
  id: number;
  code: string;
  name: string;
  positionName?: string | null;
  organizationName?: string | null;
  departmentName?: string | null;
  roleName?: string | null;
};
import { PaginationSchema } from "@/shared/schemas";

export const employeeFiltersSchema = {
  ...PaginationSchema,
  searchKeyword: { type: "string" as const, defaultValue: "" },
  isActive: { type: "nullableBoolean", defaultValue: null },
  organizationId: { type: "number", defaultValue: undefined },
  staffStatusId: { type: "number", defaultValue: undefined },
  positionId: { type: "number", defaultValue: undefined },
  managerId: { type: "number", defaultValue: undefined },
  departmentId: { type: "number", defaultValue: undefined },
  selectedId: { type: "number", defaultValue: undefined },
} as const;
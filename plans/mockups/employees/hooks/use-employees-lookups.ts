"use client";

import { useQuery } from "@tanstack/react-query";
import { useDepartmentsLookup, useOrganizationsLookupQuery } from "@/lib/query/use-lookup-queries";
import { fetchPublicSysCategoryLookup } from "@/lib/api/public-category-lookup";

export function useEmployeesLookups(organizationId: number | null) {
  const organizationsQuery = useOrganizationsLookupQuery();
  const departmentsQuery = useDepartmentsLookup(organizationId);
  const positionsQuery = useQuery({
    queryKey: ["employees", "lookups", "positions"] as const,
    queryFn: () => fetchPublicSysCategoryLookup("positions"),
  });

  return {
    organizations: organizationsQuery.data ?? [],
    departments: organizationId != null ? (departmentsQuery.data ?? []) : [],
    positions: positionsQuery.data ?? [],
    loading: {
      organizations: organizationsQuery.isLoading,
      departments: organizationId != null && departmentsQuery.isLoading,
      positions: positionsQuery.isLoading
    }
  };
}

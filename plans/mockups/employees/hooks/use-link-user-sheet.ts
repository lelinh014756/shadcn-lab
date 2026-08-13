"use client";

import { useQuery } from "@tanstack/react-query";
import { accountsServices } from "@/modules/system/accounts/services";
import type { Account } from "@/modules/system/accounts/types/account";

export type LinkableUser = Account;

type UseLinkableUsersParams = {
  organizationId: number;
  searchKeyword?: string;
  pageNumber?: number;
  pageSize?: number;
};

export function useLinkableUsers(params: UseLinkableUsersParams) {
  return useQuery<LinkableUser[]>({
    queryKey: ["employees", "linkable-users", params] as const,
    queryFn: async () => {
      const result = await accountsServices.getList({
        organizationId: params.organizationId,
        // accountStatusId: 1,
        searchKeyword: params.searchKeyword,
        pageIndex: (params.pageNumber ?? 1) - 1,
        pageSize: params.pageSize ?? 50,
      });
      return result.items;
    },
    enabled: params.organizationId > 0,
    staleTime: 1000 * 60 * 2,
  });
}

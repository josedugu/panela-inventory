"use client";

import { useQuery } from "@tanstack/react-query";
import type { RoleName } from "@/config/permissions";
import { ROLES } from "@/config/permissions";
import { getUserRoleAction } from "@/features/auth/actions/get-user-role";

export function useUserRole() {
  const { data: role, isLoading } = useQuery<RoleName | null>({
    queryKey: ["user-role"],
    queryFn: async () => {
      return await getUserRoleAction();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  return {
    role: role ?? null,
    isAdmin: role === ROLES.ADMIN,
    isLoading,
  };
}

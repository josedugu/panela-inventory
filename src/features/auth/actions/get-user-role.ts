"use server";

import type { RoleName } from "@/config/permissions";
import { getUserByAuthId } from "@/data/repositories/users.repository";
import { normalizeRole } from "@/lib/auth/normalize-role";
import { createClient } from "@/lib/supabase/server";

/**
 * Server action para obtener el rol del usuario actual (normalizado)
 * Útil para usar en componentes del cliente
 */
export async function getUserRoleAction(): Promise<RoleName | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return null;
  }

  const dbUser = await getUserByAuthId(user.id);
  return normalizeRole(dbUser?.rolNombre);
}

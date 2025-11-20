import "server-only";

import {
  getUserByAuthId,
  type UserDTO,
} from "@/data/repositories/users.repository";
import { createClient } from "@/lib/supabase/server";
import { normalizeRole } from "./normalize-role";

export interface CurrentUser extends UserDTO {
  roleName: string | null;
}

/**
 * Obtiene el usuario actual con su rol desde la base de datos
 *
 * @returns Usuario completo con rol o null si no está autenticado o no existe en BD
 */
export async function getCurrentUserWithRole(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return null;
  }

  const dbUser = await getUserByAuthId(user.id);

  if (!dbUser) {
    return null;
  }

  // Normalizar el rol para manejar diferencias de case-sensitivity
  const normalizedRole = normalizeRole(dbUser.rolNombre);

  return {
    ...dbUser,
    roleName: normalizedRole,
  } as CurrentUser;
}

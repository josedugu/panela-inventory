import "server-only";

import { ROLES, type RoleName } from "@/config/permissions";

/**
 * Normaliza el nombre del rol desde la base de datos a un RoleName válido
 * Maneja diferencias de case-sensitivity y variaciones comunes
 *
 * @param roleName - Nombre del rol desde la BD (puede tener diferentes casos)
 * @returns RoleName normalizado o null si no es un rol válido
 */
export function normalizeRole(
  roleName: string | null | undefined,
): RoleName | null {
  if (!roleName) {
    return null;
  }

  // Normalizar a minúsculas para comparación case-insensitive
  const normalized = roleName.toLowerCase().trim();

  // Mapeo de variaciones comunes a los valores esperados
  const roleMap: Record<string, RoleName> = {
    admin: ROLES.ADMIN,
    asesor: ROLES.ASESOR,
    colaborador: ROLES.COLABORADOR,
  };

  // Buscar coincidencia exacta después de normalizar
  const matchedRole = roleMap[normalized];

  if (matchedRole) {
    return matchedRole;
  }

  // Si no hay coincidencia, verificar si alguno de los valores de ROLES coincide
  // (por si acaso el valor ya está normalizado)
  const roleValues = Object.values(ROLES);
  if (roleValues.includes(normalized as RoleName)) {
    return normalized as RoleName;
  }

  // Si no hay coincidencia, retornar null
  return null;
}

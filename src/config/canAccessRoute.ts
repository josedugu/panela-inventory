import { ROUTE_PERMISSIONS, type RoleName } from "./permissions";

/**
 * Verifica si un rol tiene acceso a una ruta específica
 *
 * @param role - Nombre del rol del usuario
 * @param route - Ruta a verificar (ej: "/dashboard/sales")
 * @returns true si el rol tiene acceso, false en caso contrario
 */
export function canAccessRoute(role: RoleName | null, route: string): boolean {
  if (!role) return false;

  // Si no hay permisos definidos, permitir acceso (modo desarrollo)
  if (Object.keys(ROUTE_PERMISSIONS).length === 0) {
    return true;
  }

  const allowedRoles = ROUTE_PERMISSIONS[route];
  return allowedRoles?.includes(role) ?? false;
}

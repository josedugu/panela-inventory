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

  const normalizedRoute = route.replace(/\/+$/, "") || "/";

  // Si no hay permisos definidos, permitir acceso (modo desarrollo)
  if (Object.keys(ROUTE_PERMISSIONS).length === 0) {
    return true;
  }

  // 1) Coincidencia exacta
  const directRoles = ROUTE_PERMISSIONS[normalizedRoute];
  if (directRoles?.includes(role)) {
    return true;
  }

  // 2) Coincidencia por prefijo (para rutas hijas)
  const matchingPrefix = Object.entries(ROUTE_PERMISSIONS)
    .filter(
      ([path]) =>
        normalizedRoute === path || normalizedRoute.startsWith(`${path}/`),
    )
    .sort((a, b) => b[0].length - a[0].length)[0];

  if (matchingPrefix?.[1]?.includes(role)) {
    return true;
  }

  return false;
}

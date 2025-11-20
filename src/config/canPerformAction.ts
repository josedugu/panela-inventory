import { canAccessRoute } from "./canAccessRoute";
import { ACTION_PERMISSIONS, type RoleName } from "./permissions";

/**
 * Verifica si un rol puede realizar una acción específica en una ruta
 *
 * @param role - Nombre del rol del usuario
 * @param route - Ruta donde se realiza la acción
 * @param action - Acción a verificar (ej: "edit_price", "create", "delete")
 * @returns true si el rol puede realizar la acción, false en caso contrario
 */
export function canPerformAction(
  role: RoleName | null,
  route: string,
  action: string,
): boolean {
  if (!role) return false;

  // Si no hay permisos de acción definidos, verificar acceso general a la ruta
  if (Object.keys(ACTION_PERMISSIONS).length === 0) {
    return canAccessRoute(role, route);
  }

  const routeActions = ACTION_PERMISSIONS[route];
  if (!routeActions) {
    // Si la ruta no tiene acciones específicas, verificar acceso general
    return canAccessRoute(role, route);
  }

  return routeActions[role]?.includes(action) ?? false;
}

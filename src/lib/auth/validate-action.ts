import "server-only";

import { canAccessRoute } from "../../config/canAccessRoute";
import { canPerformAction } from "../../config/canPerformAction";
import type { RoleName } from "../../config/permissions";
import { getCurrentUserWithRole } from "./get-current-user";

export interface ValidationResult {
  allowed: boolean;
  error?: string;
  user?: Awaited<ReturnType<typeof getCurrentUserWithRole>>;
}

/**
 * Valida si el usuario actual puede acceder a una ruta
 *
 * @param route - Ruta a verificar
 * @returns Resultado de la validación con información del usuario
 */
export async function validateRouteAccess(
  route: string,
): Promise<ValidationResult> {
  const user = await getCurrentUserWithRole();

  if (!user) {
    return {
      allowed: false,
      error: "No autenticado",
    };
  }

  if (!user.roleName) {
    return {
      allowed: false,
      error: "Usuario sin rol asignado",
      user,
    };
  }

  const hasAccess = canAccessRoute(user.roleName as RoleName | null, route);

  return {
    allowed: hasAccess,
    error: hasAccess ? undefined : "Sin acceso a esta ruta",
    user,
  };
}

/**
 * Valida si el usuario actual puede realizar una acción específica
 *
 * @param route - Ruta donde se realiza la acción
 * @param action - Acción a verificar (ej: "create", "update", "edit_price")
 * @returns Resultado de la validación con información del usuario
 */
export async function validateActionPermission(
  route: string,
  action: string,
): Promise<ValidationResult> {
  const user = await getCurrentUserWithRole();

  if (!user) {
    return {
      allowed: false,
      error: "No autenticado",
    };
  }

  if (!user.roleName) {
    return {
      allowed: false,
      error: "Usuario sin rol asignado",
      user,
    };
  }

  // Primero verificar acceso general a la ruta
  const hasRouteAccess = canAccessRoute(
    user.roleName as RoleName | null,
    route,
  );
  if (!hasRouteAccess) {
    return {
      allowed: false,
      error: "Sin acceso a esta ruta",
      user,
    };
  }

  // Luego verificar la acción específica
  const canPerform = canPerformAction(
    user.roleName as RoleName | null,
    route,
    action,
  );

  return {
    allowed: canPerform,
    error: canPerform
      ? undefined
      : `Sin permiso para realizar la acción: ${action}`,
    user,
  };
}

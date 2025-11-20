"use client";

import { usePathname } from "next/navigation";
import { canAccessRoute } from "@/config/canAccessRoute";
import { canPerformAction } from "@/config/canPerformAction";
import { useUserRole } from "@/hooks/use-user-role";

interface ProtectedComponentProps {
  route?: string;
  action?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Componente que renderiza children solo si el usuario tiene los permisos necesarios
 *
 * @param route - Ruta a verificar (opcional, usa la ruta actual si no se proporciona)
 * @param action - Acción específica a verificar (opcional)
 * @param fallback - Componente a renderizar si no tiene permisos (opcional)
 * @param children - Contenido a renderizar si tiene permisos
 */
export function ProtectedComponent({
  route,
  action,
  fallback = null,
  children,
}: ProtectedComponentProps) {
  const { role, isLoading } = useUserRole();
  const pathname = usePathname();
  const targetRoute = route ?? pathname;

  if (isLoading) {
    return null;
  }

  let hasAccess = false;

  if (action) {
    hasAccess = canPerformAction(role, targetRoute, action);
  } else {
    hasAccess = canAccessRoute(role, targetRoute);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

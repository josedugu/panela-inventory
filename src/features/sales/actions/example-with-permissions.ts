"use server";

/**
 * EJEMPLO: Cómo usar validación de permisos en server actions
 *
 * Este archivo muestra el patrón recomendado para validar permisos
 * en las acciones de servidor. NO es código funcional, solo un ejemplo.
 */

import { validateActionPermission } from "@/lib/auth/validate-action";

// Ejemplo de interfaz para datos de venta
interface SaleUpdateData {
  clienteId?: string;
  precio?: number;
  // ... otros campos
}

/**
 * Ejemplo de acción de actualización con validación de permisos
 */
export async function updateSaleActionExample(
  saleId: string,
  data: SaleUpdateData,
) {
  // 1. Validar acceso general a la ruta
  const routeValidation = await validateActionPermission(
    "/dashboard/sales",
    "update",
  );

  if (!routeValidation.allowed) {
    return {
      success: false,
      error: routeValidation.error ?? "Sin acceso",
    };
  }

  const user = routeValidation.user!;
  const isAdmin = user.roleName === "Admin";

  // 2. Validar campos editables según rol
  if (!isAdmin) {
    // Usuarios no-admin solo pueden editar cliente y precio
    const allowedFields: Partial<SaleUpdateData> = {};

    if (data.clienteId !== undefined) {
      // Verificar permiso específico para editar cliente
      const canEditClient = await validateActionPermission(
        "/dashboard/sales",
        "edit_client",
      );
      if (canEditClient.allowed) {
        allowedFields.clienteId = data.clienteId;
      }
    }

    if (data.precio !== undefined) {
      // Verificar permiso específico para editar precio
      const canEditPrice = await validateActionPermission(
        "/dashboard/sales",
        "edit_price",
      );
      if (canEditPrice.allowed) {
        allowedFields.precio = data.precio;
      }
    }

    // Usar solo los campos permitidos
    // ... lógica de actualización con allowedFields
  } else {
    // Admin puede editar todo
    // ... lógica de actualización completa con data
  }

  return {
    success: true,
  };
}

/**
 * Ejemplo de acción de creación con validación de permisos
 */
export async function createSaleActionExample(data: SaleUpdateData) {
  // Validar permiso de creación
  const validation = await validateActionPermission(
    "/dashboard/sales",
    "create",
  );

  if (!validation.allowed) {
    return {
      success: false,
      error: validation.error ?? "Sin permiso para crear ventas",
    };
  }

  // ... lógica de creación
  return {
    success: true,
  };
}

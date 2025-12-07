"use server";

import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma/client";

export interface AccessibleWarehouse {
  id: string;
  nombre: string;
  codigo: string;
}

export type GetAccessibleWarehousesResult =
  | { success: true; data: AccessibleWarehouse[] }
  | { success: false; error: string };

/**
 * Obtiene las bodegas accesibles según el rol del usuario:
 * - Admin: todas las bodegas activas
 * - No-admin: solo las bodegas de su centro de costo
 */
export async function getAccessibleWarehousesAction(): Promise<GetAccessibleWarehousesResult> {
  try {
    const currentUser = await getCurrentUserWithRole();

    if (!currentUser) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const isAdmin = currentUser.roleName === "admin";

    let bodegas: AccessibleWarehouse[] = [];

    if (isAdmin) {
      // Admin ve todas las bodegas activas
      bodegas = await prisma.bodega.findMany({
        where: { estado: true },
        select: {
          id: true,
          nombre: true,
          codigo: true,
        },
        orderBy: { nombre: "asc" },
      });
    } else if (currentUser.centroCostoId) {
      // No-admin solo ve bodegas de su centro de costo
      bodegas = await prisma.bodega.findMany({
        where: {
          estado: true,
          centroCostoId: currentUser.centroCostoId,
        },
        select: {
          id: true,
          nombre: true,
          codigo: true,
        },
        orderBy: { nombre: "asc" },
      });
    } else {
      // Usuario sin centro de costo asignado
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: true,
      data: bodegas.map((b) => ({
        id: b.id,
        nombre: b.nombre,
        codigo: b.codigo,
      })),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener las bodegas accesibles";

    return {
      success: false,
      error: message,
    };
  }
}

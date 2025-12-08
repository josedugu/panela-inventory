"use server";

import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma/client";

export interface AccessibleCostCenter {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export type GetAccessibleCostCentersResult =
  | { success: true; data: AccessibleCostCenter[] }
  | { success: false; error: string };

/**
 * Obtiene los centros de costos accesibles según el rol del usuario:
 * - Admin: todos los centros de costos
 * - No-admin: solo su centro de costo asignado
 */
export async function getAccessibleCostCentersAction(): Promise<GetAccessibleCostCentersResult> {
  try {
    const currentUser = await getCurrentUserWithRole();

    if (!currentUser) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const isAdmin = currentUser.roleName === "admin";

    let costCenters: AccessibleCostCenter[] = [];

    if (isAdmin) {
      // Admin ve todos los centros de costos
      costCenters = await prisma.centroCostos.findMany({
        select: {
          id: true,
          nombre: true,
          descripcion: true,
        },
        orderBy: { nombre: "asc" },
      });
    } else if (currentUser.centroCostoId) {
      // No-admin solo ve su centro de costo asignado
      const userCostCenter = await prisma.centroCostos.findUnique({
        where: { id: currentUser.centroCostoId },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
        },
      });

      if (userCostCenter) {
        costCenters = [userCostCenter];
      }
    } else {
      // Usuario sin centro de costo asignado
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: true,
      data: costCenters,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener los centros de costos accesibles";

    return {
      success: false,
      error: message,
    };
  }
}

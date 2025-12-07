"use server";

import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma/client";
import type { ExportInventoryItem } from "../types";

export type ExportInventoryControlResult =
  | { success: true; data: ExportInventoryItem[] }
  | { success: false; error: string };

export async function exportInventoryControlAction(): Promise<ExportInventoryControlResult> {
  try {
    // 1. Verificar permisos del usuario
    const currentUser = await getCurrentUserWithRole();
    if (!currentUser) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const isAdmin = currentUser.roleName === "admin";

    // 2. Obtener bodegas accesibles según rol
    let accessibleBodegaIds: string[] = [];

    if (isAdmin) {
      // Admin ve todas las bodegas activas
      const allBodegas = await prisma.bodega.findMany({
        where: { estado: true },
        select: { id: true },
      });
      accessibleBodegaIds = allBodegas.map((b) => b.id);
    } else if (currentUser.centroCostoId) {
      // No-admin solo ve bodegas de su centro de costo
      const userBodegas = await prisma.bodega.findMany({
        where: {
          estado: true,
          centroCostoId: currentUser.centroCostoId,
        },
        select: { id: true },
      });
      accessibleBodegaIds = userBodegas.map((b) => b.id);
    }

    if (accessibleBodegaIds.length === 0) {
      return {
        success: false,
        error: "No hay bodegas accesibles",
      };
    }

    // 3. Obtener todos los productos con detalles en bodegas accesibles
    const allProductDetails = await prisma.productoDetalle.findMany({
      where: {
        estado: true,
        bodegaId: { in: accessibleBodegaIds },
      },
      select: {
        id: true,
        imei: true,
        producto: {
          select: {
            nombre: true,
          },
        },
        bodega: {
          select: {
            nombre: true,
          },
        },
        movimientoInventario: {
          select: {
            tipoMovimiento: {
              select: {
                salida: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: [{ producto: { nombre: "asc" } }, { imei: "asc" }],
    });

    // 4. Filtrar productos que existen físicamente (último movimiento no es salida)
    const physicalProducts = allProductDetails.filter((detail) => {
      const lastMovement = detail.movimientoInventario[0];
      // Debe existir un movimiento y el último no puede ser salida
      return Boolean(lastMovement && !lastMovement.tipoMovimiento?.salida);
    });

    // 5. Formatear datos para exportación
    const exportData: ExportInventoryItem[] = physicalProducts.map(
      (detail) => ({
        nombre: detail.producto.nombre || "Producto sin nombre",
        imei: detail.imei || "",
        bodega: detail.bodega?.nombre || "",
      }),
    );

    return {
      success: true,
      data: exportData,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Error al exportar los datos de control de inventario",
    };
  }
}

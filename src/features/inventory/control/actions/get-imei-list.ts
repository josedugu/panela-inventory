"use server";

import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma/client";
import type { ImeiItem } from "../types";

export type GetImeiListResult =
  | { success: true; data: ImeiItem[] }
  | { success: false; error: string };

export async function getImeiListAction(
  productId: string,
  bodegaId: string,
): Promise<GetImeiListResult> {
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

    // 2. Verificar que la bodega es accesible
    if (!isAdmin) {
      const bodega = await prisma.bodega.findFirst({
        where: {
          id: bodegaId,
          estado: true,
          centroCostoId: currentUser.centroCostoId,
        },
      });

      if (!bodega) {
        return {
          success: false,
          error: "No tiene acceso a esta bodega",
        };
      }
    }

    // 3. Obtener IMEIs del producto en la bodega
    const productDetails = await prisma.productoDetalle.findMany({
      where: {
        productoId: productId,
        bodegaId,
        estado: true,
      },
      select: {
        id: true,
        imei: true,
        movimientoInventario: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            tipoMovimiento: {
              select: { salida: true },
            },
          },
        },
      },
      orderBy: {
        imei: "asc",
      },
    });

    const imeiItems: ImeiItem[] = productDetails
      .filter((detail) => {
        const lastMovement = detail.movimientoInventario[0];
        return !lastMovement || !lastMovement.tipoMovimiento?.salida;
      })
      .map((detail) => ({
        id: detail.id,
        imei: detail.imei,
      }));

    return {
      success: true,
      data: imeiItems,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Error al obtener la lista de IMEIs",
    };
  }
}

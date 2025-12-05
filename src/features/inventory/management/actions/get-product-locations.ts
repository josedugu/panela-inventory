"use server";

import { prisma } from "@/lib/prisma/client";

export type ProductLocationItem = {
  id: string;
  imei: string | null;
};

export type ProductLocationSummary = {
  bodegaId: string;
  bodega: string;
  cantidad: number;
  // items se carga por separado bajo demanda
};

export type GetProductLocationsResult =
  | { success: true; data: ProductLocationSummary[] }
  | { success: false; error: string };

export async function getProductLocationsAction(
  productId: string,
): Promise<GetProductLocationsResult> {
  try {
    // Consulta agrupada eficiente (GROUP BY)
    // No traemos los detalles individuales, solo el conteo
    const locationGroups = await prisma.productoDetalle.groupBy({
      by: ["bodegaId"],
      where: {
        productoId: productId,
        estado: true,
        bodegaId: { not: null },
      },
      _count: {
        id: true,
      },
    });

    // Necesitamos los nombres de las bodegas, hacemos un fetch adicional eficiente
    // (O podríamos usar include en findMany con distinct, pero groupBy es más semántico para counts)
    const bodegaIds = locationGroups
      .map((g) => g.bodegaId)
      .filter((id): id is string => id !== null);

    const bodegas = await prisma.bodega.findMany({
      where: {
        id: { in: bodegaIds },
      },
      select: {
        id: true,
        nombre: true,
      },
    });

    const bodegaMap = new Map(bodegas.map((b) => [b.id, b.nombre]));

    const result: ProductLocationSummary[] = locationGroups
      .map((group) => {
        if (!group.bodegaId) return null;
        return {
          bodegaId: group.bodegaId,
          bodega: bodegaMap.get(group.bodegaId) || "Bodega Desconocida",
          cantidad: group._count.id,
        };
      })
      .filter((item): item is ProductLocationSummary => item !== null)
      .sort((a, b) => a.bodega.localeCompare(b.bodega));

    return {
      success: true,
      data: result,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Error al obtener las ubicaciones del producto",
    };
  }
}

export type GetLocationItemsResult =
  | { success: true; data: ProductLocationItem[] }
  | { success: false; error: string };

export async function getProductLocationItemsAction(
  productId: string,
  bodegaId: string,
): Promise<GetLocationItemsResult> {
  try {
    const items = await prisma.productoDetalle.findMany({
      where: {
        productoId: productId,
        bodegaId: bodegaId,
        estado: true,
      },
      select: {
        id: true,
        imei: true,
      },
      orderBy: {
        imei: "asc",
      },
    });

    return {
      success: true,
      data: items,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Error al obtener los items de la bodega",
    };
  }
}

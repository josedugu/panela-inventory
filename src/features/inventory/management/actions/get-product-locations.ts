"use server";

import { prisma } from "@/lib/prisma/client";

export type ProductLocation = {
  bodega: string;
  cantidad: number;
};

export type GetProductLocationsResult =
  | { success: true; data: ProductLocation[] }
  | { success: false; error: string };

export async function getProductLocationsAction(
  productId: string,
): Promise<GetProductLocationsResult> {
  try {
    const results = await prisma.$queryRaw<
      Array<{
        bodega: string;
        cantidad: number;
      }>
    >`
      SELECT 
        bodega,
        cantidad
      FROM "dev"."getProductLocations"(${productId}::UUID)
    `;

    return {
      success: true,
      data: results.map((row) => ({
        bodega: row.bodega,
        cantidad:
          typeof row.cantidad === "number"
            ? row.cantidad
            : Number(row.cantidad),
      })),
    };
  } catch {
    return {
      success: false,
      error: "Error al obtener las ubicaciones del producto",
    };
  }
}

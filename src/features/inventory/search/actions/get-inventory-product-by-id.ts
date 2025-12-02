"use server";

import { getProductById } from "@/data/repositories/products.repository";
import type { InventoryProduct } from "@/features/inventory/functions/types";

interface GetInventoryProductByIdSuccess {
  success: true;
  data: InventoryProduct;
}

interface GetInventoryProductByIdError {
  success: false;
  error: string;
}

type GetInventoryProductByIdResult =
  | GetInventoryProductByIdSuccess
  | GetInventoryProductByIdError;

function calculateStatus(quantity: number): InventoryProduct["status"] {
  const minStock = 10;
  if (quantity <= 0) return "out-of-stock" as const;
  if (quantity <= minStock) return "low-stock" as const;
  return "in-stock" as const;
}

export async function getInventoryProductByIdAction(
  productId: string,
): Promise<GetInventoryProductByIdResult> {
  try {
    const product = await getProductById(productId);

    if (!product || !product.estado) {
      return {
        success: false,
        error: "Producto no encontrado",
      };
    }

    const nameParts = [
      product.marca?.nombre,
      product.modelo?.nombre,
      product.modelo?.almacenamiento,
      product.modelo?.color,
    ].filter(Boolean);

    const displayName =
      nameParts.join(" ") || product.descripcion || "Producto sin nombre";

    const quantity = product.cantidad ?? 0;

    return {
      success: true,
      data: {
        id: product.id,
        name: displayName,
        quantity,
        pvp: Number(product.pvp ?? 0),
        cost: Number(product.costo ?? 0),
        category: product.tipoProducto?.nombre ?? "",
        status: calculateStatus(quantity),
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo obtener el producto";

    return {
      success: false,
      error: message,
    };
  }
}

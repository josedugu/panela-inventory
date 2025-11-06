"use server";

import { getLowStockProducts } from "@/data/repositories/products.repository";

export interface LowStockProductDTO {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  imageUrl: string | null;
  updatedAt: string;
}

export async function getLowStockProductsAction(
  threshold = 10,
): Promise<LowStockProductDTO[]> {
  const products = await getLowStockProducts(threshold);

  return products.map((product) => ({
    id: product.id,
    name:
      product.descripcion ??
      product.modelo?.nombre ??
      product.tipoProducto?.nombre ??
      "Producto",
    sku: product.productosDetalles[0]?.imei ?? "-",
    category: product.tipoProducto?.nombre ?? null,
    price: Number(product.costo ?? 0),
    quantity: product.cantidad ?? 0,
    lowStockThreshold: threshold,
    imageUrl: product.imagenUrl ?? null,
    updatedAt: product.updatedAt.toISOString(),
  }));
}

"use server";

import type { InventoryProduct } from "@/features/inventory/functions/types";
import { prisma } from "@/lib/prisma/client";

interface SearchInventoryProductsSuccess {
  success: true;
  data: InventoryProduct[];
  total: number;
  matchType: "product" | "imei" | "mixed";
  matchedImeiInfo?: {
    imei: string;
    productDetailId: string;
    bodegaNombre: string | null;
    productName: string;
  };
}

interface SearchInventoryProductsError {
  success: false;
  error: string;
}

export type SearchInventoryProductsResult =
  | SearchInventoryProductsSuccess
  | SearchInventoryProductsError;

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function calculateStatus(quantity: number): InventoryProduct["status"] {
  const minStock = 10;
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= minStock) return "low-stock";
  return "in-stock";
}

export async function searchInventoryProductsAction(
  query: string,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<SearchInventoryProductsResult> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { success: true, data: [], total: 0, matchType: "product" };
  }

  // Normalizar parámetros de paginación
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedPageSize = Math.min(
    Math.max(1, Math.floor(pageSize)),
    MAX_PAGE_SIZE,
  );
  const offset = (normalizedPage - 1) * normalizedPageSize;

  try {
    // Llamada a la función SQL optimizada
    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        nombre: string;
        cantidad: number;
        pvp: number;
        costo: number;
        tipo_producto: string;
        bodegas: string[];
        match_type: string;
        matched_imei: string | null;
        matched_detail_id: string | null;
        matched_bodega_nombre: string | null;
        total_count: bigint; // Prisma devuelve BigInt para COUNT(*)
      }>
    >`
      SELECT * FROM dev.search_inventory_products(
        ${trimmedQuery}::text, 
        ${normalizedPageSize}::int, 
        ${offset}::int
      )
    `;

    if (!results || results.length === 0) {
      return { success: true, data: [], total: 0, matchType: "product" };
    }

    // El total count viene en cada fila (es redundante pero eficiente para paginación simple)
    // Convertimos BigInt a number
    const total = Number(results[0].total_count);

    // Mapear resultados al formato InventoryProduct
    const mappedData: InventoryProduct[] = results.map((row) => ({
      id: row.id,
      name: row.nombre || "Producto sin nombre",
      quantity: row.cantidad,
      pvp: Number(row.pvp),
      cost: Number(row.costo),
      category: row.tipo_producto || "",
      status: calculateStatus(row.cantidad),
      bodegas: row.bodegas || [],

      // Campos adicionales para lógica de UI
      foundByImei: row.match_type === "imei",
      matchedImei: row.matched_imei || undefined,
      matchedProductDetailId: row.matched_detail_id || undefined,
    }));

    // Extraer info de match si es el caso
    let matchedImeiInfo:
      | {
          imei: string;
          productDetailId: string;
          bodegaNombre: string | null;
          productName: string;
        }
      | undefined;
    const firstMatch = results[0];

    if (
      firstMatch.match_type === "imei" &&
      firstMatch.matched_imei &&
      firstMatch.matched_detail_id
    ) {
      matchedImeiInfo = {
        imei: firstMatch.matched_imei,
        productDetailId: firstMatch.matched_detail_id,
        bodegaNombre: firstMatch.matched_bodega_nombre,
        productName: firstMatch.nombre,
      };
    }

    return {
      success: true,
      data: mappedData,
      total,
      matchType: (firstMatch.match_type as "product" | "imei") || "product",
      matchedImeiInfo,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudieron buscar productos";

    return { success: false, error: message };
  }
}

"use server";

import type { Prisma } from "@prisma/client";
import type { InventoryProduct } from "@/features/inventory/functions/types";
import { prisma } from "@/lib/prisma/client";

interface SearchInventoryProductsSuccess {
  success: true;
  data: InventoryProduct[];
  total: number;
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

function mapToInventoryProduct(product: {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  cantidad: number | null;
  pvp: Prisma.Decimal | null;
  costo: Prisma.Decimal | null;
  tipoProducto: { nombre: string | null } | null;
  marca: { nombre: string | null } | null;
  modelo: {
    nombre: string | null;
    almacenamiento: string | null;
    color: string | null;
  } | null;
}): InventoryProduct {
  const quantity = product.cantidad ?? 0;

  return {
    id: product.id,
    name: product.nombre || "Producto sin nombre",
    quantity,
    pvp: product.pvp ? Number(product.pvp) : 0,
    cost: product.costo ? Number(product.costo) : 0,
    category: product.tipoProducto?.nombre ?? "",
    status: calculateStatus(quantity),
  };
}

export async function searchInventoryProductsAction(
  query: string,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<SearchInventoryProductsResult> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { success: true, data: [], total: 0 };
  }

  // Normalizar parámetros de paginación
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedPageSize = Math.min(
    Math.max(1, Math.floor(pageSize)),
    MAX_PAGE_SIZE,
  );
  const skip = (normalizedPage - 1) * normalizedPageSize;

  // Si la query es un UUID, buscar por ID exacto para acelerar
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmedQuery,
    );

  try {
    if (isUUID) {
      const product = await prisma.producto.findUnique({
        where: {
          id: trimmedQuery,
          estado: true,
        },
        include: {
          tipoProducto: true,
          marca: true,
          modelo: true,
        },
      });

      if (!product) {
        return { success: true, data: [], total: 0 };
      }

      return {
        success: true,
        data: [mapToInventoryProduct(product)],
        total: 1,
      };
    }

    // Búsqueda simplificada: solo en el campo nombre de productos activos
    // Esto permite encontrar accesorios que solo tienen nombre sin relaciones
    const whereClause: Prisma.ProductoWhereInput = {
      estado: true,
      nombre: {
        contains: trimmedQuery,
        mode: "insensitive" as const,
      },
    };

    // Contar el total de resultados
    const total = await prisma.producto.count({
      where: whereClause,
    });

    // Obtener los resultados paginados
    const products = await prisma.producto.findMany({
      where: whereClause,
      include: {
        tipoProducto: true,
        marca: true,
        modelo: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: normalizedPageSize,
    });

    return {
      success: true,
      data: products.map(mapToInventoryProduct),
      total,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudieron buscar productos";

    return { success: false, error: message };
  }
}

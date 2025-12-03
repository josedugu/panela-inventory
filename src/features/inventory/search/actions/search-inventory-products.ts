"use server";

import type { Prisma } from "@prisma/client";
import type { InventoryProduct } from "@/features/inventory/functions/types";
import { prisma } from "@/lib/prisma/client";

interface SearchInventoryProductsSuccess {
  success: true;
  data: InventoryProduct[];
}

interface SearchInventoryProductsError {
  success: false;
  error: string;
}

export type SearchInventoryProductsResult =
  | SearchInventoryProductsSuccess
  | SearchInventoryProductsError;

const MAX_RESULTS = 100;

function calculateStatus(quantity: number): InventoryProduct["status"] {
  const minStock = 10;
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= minStock) return "low-stock";
  return "in-stock";
}

function buildDisplayName(product: {
  marca: { nombre: string | null } | null;
  modelo: {
    nombre: string | null;
    almacenamiento: string | null;
    color: string | null;
  } | null;
  descripcion: string | null;
}) {
  const nameParts = [
    product.marca?.nombre,
    product.modelo?.nombre,
    product.modelo?.almacenamiento,
    product.modelo?.color,
  ].filter(Boolean);

  return nameParts.join(" ") || product.descripcion || "Producto sin nombre";
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
    name: buildDisplayName(product),
    quantity,
    pvp: product.pvp ? Number(product.pvp) : 0,
    cost: product.costo ? Number(product.costo) : 0,
    category: product.tipoProducto?.nombre ?? "",
    status: calculateStatus(quantity),
  };
}

export async function searchInventoryProductsAction(
  query: string,
  take: number = MAX_RESULTS,
): Promise<SearchInventoryProductsResult> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { success: true, data: [] };
  }

  const normalizedTake =
    take > MAX_RESULTS ? MAX_RESULTS : Math.max(1, Math.floor(take));

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
        return { success: true, data: [] };
      }

      return {
        success: true,
        data: [mapToInventoryProduct(product)],
      };
    }

    const isFullUuidSearch =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        trimmedQuery,
      );
    const isAutoImeiSearch = trimmedQuery.startsWith("AUTO-");

    const products = await prisma.producto.findMany({
      where: {
        estado: true,
        OR: [
          {
            nombre: {
              contains: trimmedQuery,
              mode: "insensitive",
            },
          },
          {
            descripcion: {
              contains: trimmedQuery,
              mode: "insensitive",
            },
          },
          {
            marca: {
              nombre: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
          },
          {
            modelo: {
              nombre: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
          },
          {
            modelo: {
              almacenamiento: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
          },
          {
            modelo: {
              color: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
          },
          ...(isFullUuidSearch || isAutoImeiSearch
            ? [
                {
                  productosDetalles: {
                    some: {
                      estado: true,
                      imei: {
                        contains: trimmedQuery,
                        mode: "insensitive" as const,
                      },
                    },
                  },
                },
              ]
            : []),
        ],
      },
      include: {
        tipoProducto: true,
        marca: true,
        modelo: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: normalizedTake,
    });

    return {
      success: true,
      data: products.map(mapToInventoryProduct),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudieron buscar productos";

    return { success: false, error: message };
  }
}

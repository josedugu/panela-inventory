"use server";

import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma/client";
import type {
  InventoryControlBodega,
  InventoryControlData,
  InventoryControlProduct,
} from "../types";

export type GetInventoryControlDataResult =
  | { success: true; data: InventoryControlData }
  | { success: false; error: string };

// Función auxiliar para obtener bodegas accesibles según el rol del usuario
async function getAccessibleBodegaIds(currentUser: {
  roleName: string | null;
  centroCostoId?: string | null;
}): Promise<string[]> {
  const isAdmin = currentUser.roleName === "admin";

  if (isAdmin) {
    // Admin ve todas las bodegas activas
    const allBodegas = await prisma.bodega.findMany({
      where: { estado: true },
      select: { id: true },
    });
    return allBodegas.map((b) => b.id);
  }

  if (currentUser.centroCostoId) {
    // No-admin solo ve bodegas de su centro de costo
    const userBodegas = await prisma.bodega.findMany({
      where: {
        estado: true,
        centroCostoId: currentUser.centroCostoId,
      },
      select: { id: true },
    });
    return userBodegas.map((b) => b.id);
  }

  return [];
}

// Tipos auxiliares
interface ProductDetailWithMovement {
  id: string;
  bodegaId: string;
  movimientoInventario: Array<{
    tipoMovimiento: {
      ingreso: boolean;
      salida: boolean;
    } | null;
  }>;
}

interface ProductWithDetails {
  id: string;
  nombre: string | null;
  costo: number | null;
  pvp: number | null;
  productosDetalles: ProductDetailWithMovement[];
}

// Función auxiliar para verificar si un producto existe físicamente
function isProductPhysical(
  productDetails: ProductDetailWithMovement[],
): boolean {
  return productDetails.some((detail) => {
    const lastMovement = detail.movimientoInventario[0];
    if (!lastMovement?.tipoMovimiento) return false;
    // Existe físicamente si el último movimiento NO es una salida
    return !lastMovement.tipoMovimiento.salida;
  });
}

// Función auxiliar para calcular cantidades por bodega
function calculateBodegaQuantities(
  productDetails: ProductDetailWithMovement[],
): Map<string, number> {
  const bodegaMap = new Map<string, number>();

  for (const detail of productDetails) {
    const lastMovement = detail.movimientoInventario[0];
    if (!lastMovement?.tipoMovimiento || lastMovement.tipoMovimiento.salida)
      continue;

    const currentCount = bodegaMap.get(detail.bodegaId) || 0;
    bodegaMap.set(detail.bodegaId, currentCount + 1);
  }

  return bodegaMap;
}

// Función auxiliar para crear bodegas del producto
function createProductBodegas(
  bodegaMap: Map<string, number>,
): InventoryControlBodega[] {
  const productBodegas: InventoryControlBodega[] = [];
  for (const [bodegaId, cantidad] of bodegaMap.entries()) {
    productBodegas.push({
      id: bodegaId,
      nombre: "", // Se llenará después
      cantidad,
      isPhysical: true,
    });
  }
  return productBodegas;
}

// Función auxiliar para procesar productos físicos
function processPhysicalProducts(
  productsWithPhysicalStatus: ProductWithDetails[],
): {
  products: InventoryControlProduct[];
  totalCosto: number;
  totalPvp: number;
} {
  const physicalProducts: InventoryControlProduct[] = [];
  let totalCosto = 0;
  let totalPvp = 0;

  for (const product of productsWithPhysicalStatus) {
    if (!isProductPhysical(product.productosDetalles)) continue;

    const bodegaMap = calculateBodegaQuantities(product.productosDetalles);
    if (bodegaMap.size === 0) continue;

    const productBodegas = createProductBodegas(bodegaMap);

    const productData: InventoryControlProduct = {
      id: product.id,
      nombre: product.nombre || "Producto sin nombre",
      costo: Number(product.costo || 0),
      pvp: Number(product.pvp || 0),
      bodegas: productBodegas,
    };

    physicalProducts.push(productData);

    // Acumular totales
    const totalUnidades = productBodegas.reduce(
      (sum, b) => sum + b.cantidad,
      0,
    );
    totalCosto += productData.costo * totalUnidades;
    totalPvp += productData.pvp * totalUnidades;
  }

  return { products: physicalProducts, totalCosto, totalPvp };
}

export async function getInventoryControlDataAction(): Promise<GetInventoryControlDataResult> {
  try {
    // 1. Obtener usuario actual
    const currentUser = await getCurrentUserWithRole();
    if (!currentUser) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    // 2. Obtener bodegas accesibles según rol
    const accessibleBodegaIds = await getAccessibleBodegaIds(currentUser);
    if (accessibleBodegaIds.length === 0) {
      return {
        success: false,
        error: "No hay bodegas accesibles",
      };
    }

    // 3. Obtener productos que existen físicamente
    const productsWithPhysicalStatus = await prisma.producto.findMany({
      where: {
        estado: true,
        productosDetalles: {
          some: {
            estado: true,
            bodegaId: { in: accessibleBodegaIds },
          },
        },
      },
      select: {
        id: true,
        nombre: true,
        costo: true,
        pvp: true,
        productosDetalles: {
          where: {
            estado: true,
            bodegaId: { in: accessibleBodegaIds },
          },
          select: {
            id: true,
            bodegaId: true,
            movimientoInventario: {
              select: {
                tipoMovimiento: {
                  select: {
                    ingreso: true,
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
        },
      },
    });

    // 4. Procesar productos físicos y calcular totales
    const {
      products: physicalProducts,
      totalCosto,
      totalPvp,
    } = processPhysicalProducts(productsWithPhysicalStatus);

    // 5. Obtener nombres de bodegas y actualizar productos
    const bodegaIds = [
      ...new Set(physicalProducts.flatMap((p) => p.bodegas.map((b) => b.id))),
    ];
    const bodegasInfo = await prisma.bodega.findMany({
      where: { id: { in: bodegaIds } },
      select: { id: true, nombre: true },
    });

    const bodegaNameMap = new Map(bodegasInfo.map((b) => [b.id, b.nombre]));

    // Actualizar nombres de bodegas en productos
    for (const product of physicalProducts) {
      for (const bodega of product.bodegas) {
        bodega.nombre = bodegaNameMap.get(bodega.id) || "Bodega desconocida";
      }
    }

    // 6. Crear resultado final
    const availableBodegas: InventoryControlBodega[] = bodegasInfo.map((b) => ({
      id: b.id,
      nombre: b.nombre,
      cantidad: 0,
      isPhysical: true,
    }));

    const result: InventoryControlData = {
      stats: { totalCosto, totalPvp },
      products: physicalProducts,
      bodegas: availableBodegas,
    };

    return { success: true, data: result };
  } catch (_error) {
    return {
      success: false,
      error: "Error al obtener los datos de control de inventario",
    };
  }
}

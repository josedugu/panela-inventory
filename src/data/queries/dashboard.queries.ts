import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface DashboardMetrics {
  totalProducts: number;
  inventoryValue: number;
  lowStockCount: number;
  totalStock: number;
}

export interface RecentActivityItem {
  id: string;
  imei: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [totalProducts, lowStockCount, inventoryRecords] = await Promise.all([
    prisma.producto.count(),
    prisma.movimientoInventario.count({
      where: {
        cantidad: {
          lte: 10,
        },
        estado: true,
      },
    }),
    prisma.movimientoInventario.findMany({
      select: {
        cantidad: true,
        producto: {
          select: {
            precio: true,
          },
        },
      },
    }),
  ]);

  const { totalStock, inventoryValue } = inventoryRecords.reduce(
    (acc, item) => {
      const price = Number(item.producto.precio);
      return {
        totalStock: acc.totalStock + item.cantidad,
        inventoryValue: acc.inventoryValue + price * item.cantidad,
      };
    },
    { totalStock: 0, inventoryValue: 0 },
  );

  return {
    totalProducts,
    lowStockCount,
    totalStock,
    inventoryValue,
  };
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const products = await prisma.producto.findMany({
    select: {
      id: true,
      imei: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return products.map((product) => ({
    id: product.id,
    imei: product.imei ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));
}

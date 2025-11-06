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
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [totalProducts, lowStockCount, products] = await Promise.all([
    prisma.producto.count(),
    prisma.producto.count({
      where: {
        cantidad: {
          lte: 10,
        },
        estado: true,
      },
    }),
    prisma.producto.findMany({
      select: {
        cantidad: true,
        costo: true,
      },
    }),
  ]);

  const { totalStock, inventoryValue } = products.reduce(
    (acc, product) => {
      const cost = product.costo ? Number(product.costo) : 0;
      return {
        totalStock: acc.totalStock + product.cantidad,
        inventoryValue: acc.inventoryValue + cost * product.cantidad,
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
      descripcion: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return products.map((product) => ({
    id: product.id,
    name: product.descripcion ?? "Sin descripción",
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));
}

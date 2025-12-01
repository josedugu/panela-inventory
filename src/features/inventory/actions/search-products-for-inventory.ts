"use server";

import { prisma } from "@/lib/prisma/client";

export async function searchProductsForInventoryAction(query: string) {
  // Si la query es un UUID, buscar por ID exacto
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      query,
    );

  if (isUUID) {
    const product = await prisma.producto.findUnique({
      where: {
        id: query,
        estado: true,
      },
      select: {
        id: true,
        nombre: true,
      },
    });

    if (product) {
      return [
        {
          id: product.id,
          label: product.nombre ?? "Producto sin nombre",
        },
      ];
    }
    return [];
  }

  // Búsqueda por nombre
  const products = await prisma.producto.findMany({
    where: {
      estado: true,
      nombre: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
    take: 10,
  });

  return products.map((product) => ({
    id: product.id,
    label: product.nombre ?? "Producto sin nombre",
  }));
}

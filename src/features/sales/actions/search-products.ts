"use server";

import { prisma } from "@/lib/prisma/client";

export async function searchProductsAction(query: string) {
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
        cantidad: {
          gt: 0,
        },
      },
      select: {
        id: true,
        nombre: true,
        pvp: true,
        precioOferta: true,
        cantidad: true,
        tipoProducto: {
          select: {
            productoBaseParaOferta: true,
          },
        },
      },
    });

    if (product) {
      return [
        {
          id: product.id,
          label: product.nombre ?? "Producto sin nombre",
          pvp: product.pvp ? Number(product.pvp) : 0,
          precioOferta: product.precioOferta
            ? Number(product.precioOferta)
            : null,
          esProductoBase: product.tipoProducto?.productoBaseParaOferta ?? false,
          availableQuantity: product.cantidad ?? 0,
        },
      ];
    }
    return [];
  }

  // Búsqueda por nombre
  const products = await prisma.producto.findMany({
    where: {
      estado: true,
      cantidad: {
        gt: 0,
      },
      nombre: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      nombre: true,
      pvp: true,
      precioOferta: true,
      cantidad: true,
      tipoProducto: {
        select: {
          productoBaseParaOferta: true,
        },
      },
    },
    orderBy: {
      nombre: "asc",
    },
    take: 10,
  });

  return products.map((product) => ({
    id: product.id,
    label: product.nombre ?? "Producto sin nombre",
    pvp: product.pvp ? Number(product.pvp) : 0,
    precioOferta: product.precioOferta ? Number(product.precioOferta) : null,
    esProductoBase: product.tipoProducto?.productoBaseParaOferta ?? false,
    availableQuantity: product.cantidad ?? 0,
  }));
}

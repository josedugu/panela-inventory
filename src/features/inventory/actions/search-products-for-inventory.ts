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

  const trimmedQuery = query.trim();

  // Si la búsqueda no es un UUID completo, excluir IMEIs generados automáticamente
  const isFullUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmedQuery,
    );
  const isAutoImeiSearch = trimmedQuery.startsWith("AUTO-");

  // Búsqueda por nombre, marca, modelo o IMEI
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
        // Solo buscar por IMEI si:
        // 1. Es un UUID completo (búsqueda exacta)
        // 2. Es una búsqueda explícita de AUTO-IMEI
        // 3. No es una búsqueda de texto libre (para evitar mostrar productos por UUID generado)
        ...(isFullUuid || isAutoImeiSearch
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
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 10,
  });

  return products.map((product) => {
    return {
      id: product.id,
      label: product.nombre ?? "Producto sin nombre",
    };
  });
}

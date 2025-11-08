import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export type ProductWithRelations = Prisma.ProductoGetPayload<{
  include: {
    tipoProducto: true;
    marca: true;
    modelo: true;
    productoDescuento: true;
    productosDetalles: {
      include: {
        movimientoInventario: true;
      };
    };
  };
}>;

export type ProductDetailWithRelations = Prisma.ProductoDetalleGetPayload<{
  include: {
    producto: {
      include: {
        tipoProducto: true;
        marca: true;
        modelo: true;
        productoDescuento: true;
        almacenamiento: true;
        ram: true;
        color: true;
      };
    };
    movimientoInventario: {
      include: {
        proveedor: true;
      };
    };
  };
}>;

export async function getAllProducts(): Promise<ProductWithRelations[]> {
  return prisma.producto.findMany({
    where: {
      estado: true,
    },
    include: {
      tipoProducto: true,
      marca: true,
      modelo: true,
      productoDescuento: true,
      productosDetalles: {
        where: {
          estado: true,
        },
        include: {
          movimientoInventario: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Código original comentado - ahora usamos función SQL para filtrar productos físicamente activos
// export async function getAllProductDetails(): Promise<ProductDetailWithRelations[]> {
//   return prisma.productoDetalle.findMany({
//     where: {
//       estado: true,
//       producto: {
//         estado: true,
//       },
//     },
//     include: {
//       producto: {
//         include: {
//           tipoProducto: true,
//           marca: true,
//           modelo: true,
//           proveedor: true,
//           bodega: true,
//           productoDescuento: true,
//           almacenamiento: true,
//           ram: true,
//           color: true,
//         },
//       },
//       movimientoInventario: true,
//     },
//     orderBy: { createdAt: "desc" },
//   });
// }

export async function getAllProductDetails(
  limit?: number,
  offset?: number,
): Promise<ProductDetailWithRelations[]> {
  // Ejecutar función SQL que filtra productos físicamente activos con paginación
  // Si limit es undefined, pasar NULL explícitamente
  // Hacer cast explícito a INTEGER porque Prisma envía bigint
  const limitParam = limit !== undefined ? limit : null;
  const offsetParam = offset ?? 0;

  // Construir la query con cast explícito, manejando NULL para limit
  const detailIds =
    limitParam === null
      ? await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM "dev"."getAllProductDetails"(
            NULL, 
            ${offsetParam}::INTEGER
          )
        `
      : await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM "dev"."getAllProductDetails"(
            ${limitParam}::INTEGER, 
            ${offsetParam}::INTEGER
          )
        `;

  const ids = detailIds.map((row) => row.id);

  // Si no hay resultados, retornar array vacío
  if (ids.length === 0) {
    return [];
  }

  // Obtener los detalles completos con todas las relaciones usando Prisma
  return prisma.productoDetalle.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      producto: {
        include: {
          tipoProducto: true,
          marca: true,
          modelo: true,
          productoDescuento: true,
          almacenamiento: true,
          ram: true,
          color: true,
        },
      },
      movimientoInventario: {
        include: {
          proveedor: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllProductDetailsCount(): Promise<number> {
  // Obtener el total de registros sin paginación
  const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT "dev"."getAllProductDetailsCount"() as count
  `;

  return Number(result[0]?.count ?? 0);
}

export async function getProductById(
  id: string,
): Promise<ProductWithRelations | null> {
  return prisma.producto.findUnique({
    where: { id },
    include: {
      tipoProducto: true,
      marca: true,
      modelo: true,
      productoDescuento: true,
      productosDetalles: {
        where: {
          estado: true,
        },
        include: {
          movimientoInventario: true,
        },
      },
    },
  });
}

export async function searchProducts(
  query: string,
): Promise<ProductWithRelations[]> {
  return prisma.producto.findMany({
    where: {
      estado: true,
      OR: [
        { descripcion: { contains: query, mode: "insensitive" } },
        {
          productosDetalles: {
            some: {
              estado: true,
              imei: { contains: query, mode: "insensitive" },
            },
          },
        },
        {
          marca: {
            nombre: { contains: query, mode: "insensitive" },
          },
        },
        {
          modelo: {
            nombre: { contains: query, mode: "insensitive" },
          },
        },
        {
          tipoProducto: {
            nombre: { contains: query, mode: "insensitive" },
          },
        },
      ],
    },
    include: {
      tipoProducto: true,
      marca: true,
      modelo: true,
      productoDescuento: true,
      productosDetalles: {
        where: {
          estado: true,
        },
        include: {
          movimientoInventario: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getLowStockProducts(
  threshold: number = 20,
): Promise<ProductWithRelations[]> {
  return prisma.producto.findMany({
    where: {
      cantidad: {
        lte: threshold,
      },
      estado: true,
    },
    include: {
      tipoProducto: true,
      marca: true,
      modelo: true,
      productoDescuento: true,
      productosDetalles: {
        where: {
          estado: true,
        },
        include: {
          movimientoInventario: true,
        },
      },
    },
  });
}

type CreateProductInput = Pick<
  Prisma.ProductoUncheckedCreateInput,
  | "estado"
  | "descripcion"
  | "costo"
  | "cantidad"
  | "tipoProductoId"
  | "imagenUrl"
  | "marcaId"
  | "modeloId"
>;

export async function createProduct(productData: CreateProductInput) {
  const { costo, ...rest } = productData;

  return prisma.producto.create({
    data: {
      ...rest,
      ...(costo !== undefined
        ? { costo: new Prisma.Decimal(costo?.toString() ?? "0") }
        : {}),
    },
  });
}

type UpdateProductInput = Partial<
  Pick<
    Prisma.ProductoUncheckedUpdateInput,
    | "descripcion"
    | "costo"
    | "cantidad"
    | "tipoProductoId"
    | "imagenUrl"
    | "marcaId"
    | "modeloId"
    | "estado"
  >
>;

export async function updateProduct(id: string, updates: UpdateProductInput) {
  const { costo, ...rest } = updates;

  return prisma.producto.update({
    where: { id },
    data: {
      ...rest,
      ...(costo !== undefined
        ? { costo: new Prisma.Decimal(costo?.toString() ?? "0") }
        : {}),
    },
  });
}

export async function deleteProduct(id: string) {
  await prisma.productoDetalle.deleteMany({ where: { productoId: id } });
  await prisma.producto.delete({ where: { id } });
}

export async function deleteProductDetail(id: string) {
  return prisma.productoDetalle.delete({
    where: { id },
  });
}

export async function updateInventory(productId: string, quantity: number) {
  return prisma.producto.update({
    where: { id: productId },
    data: { cantidad: quantity },
  });
}

export async function createProductDetail({
  productId,
  imei,
  name,
}: {
  productId: string;
  imei: string;
  name?: string;
}) {
  return prisma.productoDetalle.create({
    data: {
      productoId: productId,
      imei,
      nombre: name,
    },
  });
}

/**
 * Busca un producto existente con las mismas características o lo crea si no existe
 */
export async function findOrCreateProduct(productData: {
  costo?: number | null;
  descripcion?: string | null;
  tipoProductoId?: string | null;
  imagenUrl?: string | null;
  marcaId?: string | null;
  modeloId?: string | null;
  estado?: boolean;
}): Promise<{ id: string }> {
  // Construir el where clause dinámicamente para manejar nulls correctamente
  const whereClause: Prisma.ProductoWhereInput = {
    estado: productData.estado ?? true,
  };

  if (productData.marcaId !== undefined) {
    whereClause.marcaId = productData.marcaId;
  }
  if (productData.modeloId !== undefined) {
    whereClause.modeloId = productData.modeloId;
  }
  if (productData.tipoProductoId !== undefined) {
    whereClause.tipoProductoId = productData.tipoProductoId;
  }

  // Buscar producto existente con las mismas características
  const existingProduct = await prisma.producto.findFirst({
    where: whereClause,
  });

  if (existingProduct) {
    // Si existe, actualizar costo si es diferente
    if (productData.costo !== undefined && productData.costo !== null) {
      const currentCost = existingProduct.costo
        ? Number(existingProduct.costo)
        : null;
      if (currentCost !== productData.costo) {
        await prisma.producto.update({
          where: { id: existingProduct.id },
          data: {
            costo: productData.costo
              ? new Prisma.Decimal(productData.costo.toString())
              : null,
          },
        });
      }
    }
    return { id: existingProduct.id };
  }

  // Si no existe, crear el producto
  const newProduct = await createProduct({
    costo: productData.costo,
    descripcion: productData.descripcion ?? undefined,
    tipoProductoId: productData.tipoProductoId ?? undefined,
    imagenUrl: productData.imagenUrl ?? undefined,
    marcaId: productData.marcaId ?? undefined,
    modeloId: productData.modeloId ?? undefined,
    estado: productData.estado ?? true,
    cantidad: 0, // La cantidad se maneja a través de los detalles
  });

  return { id: newProduct.id };
}

export interface InventoryFilterOptions {
  categories: string[];
  brands: string[];
  models: string[];
  storages: string[];
  colors: string[];
  suppliers: string[];
  statuses: Array<"in-stock" | "low-stock" | "out-of-stock">;
}

export async function getInventoryFilterOptions(): Promise<InventoryFilterOptions> {
  const products = await prisma.producto.findMany({
    select: {
      tipoProducto: {
        select: {
          nombre: true,
        },
      },
      marca: {
        select: {
          nombre: true,
        },
      },
      modelo: {
        select: {
          nombre: true,
          almacenamiento: true,
          color: true,
        },
      },
    },
  });

  const movements = await prisma.movimientoInventario.findMany({
    select: {
      proveedor: {
        select: {
          nombre: true,
        },
      },
    },
  });

  const categories = new Set<string>();
  const brands = new Set<string>();
  const models = new Set<string>();
  const storages = new Set<string>();
  const colors = new Set<string>();
  const suppliers = new Set<string>();

  for (const product of products) {
    if (product.tipoProducto?.nombre) {
      categories.add(product.tipoProducto.nombre);
    }
    if (product.marca?.nombre) {
      brands.add(product.marca.nombre);
    }
    if (product.modelo?.nombre) {
      models.add(product.modelo.nombre);
    }
    if (product.modelo?.almacenamiento) {
      storages.add(product.modelo.almacenamiento);
    }
    if (product.modelo?.color) {
      colors.add(product.modelo.color);
    }
  }

  for (const movement of movements) {
    if (movement.proveedor?.nombre) {
      suppliers.add(movement.proveedor.nombre);
    }
  }

  const toSortedArray = (values: Set<string>) =>
    Array.from(values)
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .sort((a, b) => a.localeCompare(b));

  return {
    categories: toSortedArray(categories),
    brands: toSortedArray(brands),
    models: toSortedArray(models),
    storages: toSortedArray(storages),
    colors: toSortedArray(colors),
    suppliers: toSortedArray(suppliers),
    statuses: ["in-stock", "low-stock", "out-of-stock"],
  };
}

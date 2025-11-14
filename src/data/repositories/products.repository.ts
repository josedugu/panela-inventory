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

export type AggregatedProductData = {
  id: string;
  nombre: string;
  cantidad: number;
  pvp: number;
  costo: number;
  categoria: string;
};

export async function getAllProductDetails(
  limit?: number,
  offset?: number,
): Promise<AggregatedProductData[]> {
  // Ejecutar función SQL que retorna datos agregados por producto
  const limitParam = limit !== undefined ? limit : null;
  const offsetParam = offset ?? 0;

  // Construir la query - la función SQL ya retorna los tipos correctos
  const results =
    limitParam === null
      ? await prisma.$queryRaw<
          Array<{
            id: string;
            nombre: string;
            cantidad: number;
            pvp: number;
            costo: number;
            categoria: string;
          }>
        >`
          SELECT 
            id,
            nombre,
            cantidad,
            pvp,
            costo,
            categoria
          FROM "dev"."getAllProductDetails"(
            NULL, 
            ${offsetParam}::INTEGER
          )
        `
      : await prisma.$queryRaw<
          Array<{
            id: string;
            nombre: string;
            cantidad: number;
            pvp: number;
            costo: number;
            categoria: string;
          }>
        >`
          SELECT 
            id,
            nombre,
            cantidad,
            pvp,
            costo,
            categoria
          FROM "dev"."getAllProductDetails"(
            ${limitParam}::INTEGER, 
            ${offsetParam}::INTEGER
          )
        `;

  // Convertir Decimal a number si es necesario
  return results.map((row) => ({
    id: row.id,
    nombre: row.nombre,
    cantidad:
      typeof row.cantidad === "number" ? row.cantidad : Number(row.cantidad),
    pvp: typeof row.pvp === "number" ? row.pvp : Number(row.pvp),
    costo: typeof row.costo === "number" ? row.costo : Number(row.costo),
    categoria: row.categoria,
  }));
}

export async function getAllProductDetailsCount(): Promise<number> {
  // Obtener el total de registros sin paginación
  const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT "dev"."getAllProductDetailsCount"() as count
  `;

  return Number(result[0]?.count ?? 0);
}

// Tipo para filtros de inventario
export interface InventoryFilters {
  category?: string;
  brand?: string;
  model?: string;
  storage?: string;
  color?: string;
  imei?: string;
  supplier?: string;
  status?: string;
  cost?: string; // Formato: ">=100" o "<=50" o "=25"
  quantity?: string; // Formato: ">=10" o "<=5" o "=0"
}

// Función auxiliar para parsear filtros numéricos
function parseNumericFilter(
  filterValue: string | undefined,
): { operator: ">=" | "<=" | "="; value: number } | null {
  if (!filterValue) return null;
  const match = filterValue.match(/^(>=|<=|=)\s*(\d+(?:\.\d*)?)$/);
  if (!match) return null;
  const numericValue = Number(match[2]);
  if (Number.isNaN(numericValue)) return null;
  return {
    operator: match[1] as ">=" | "<=" | "=",
    value: numericValue,
  };
}

// Función para calcular el estado del inventario
function calculateStatus(
  quantity: number,
): "in-stock" | "low-stock" | "out-of-stock" {
  const minStock = 10;
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= minStock) return "low-stock";
  return "in-stock";
}

// Obtener productos con filtros aplicados usando Prisma
export async function getFilteredProductDetails(
  filters: InventoryFilters = {},
  limit?: number,
  offset?: number,
): Promise<AggregatedProductData[]> {
  const whereClause: Prisma.ProductoWhereInput = {
    estado: true,
  };

  // Filtro por categoría
  if (filters.category) {
    whereClause.tipoProducto = {
      nombre: {
        equals: filters.category,
        mode: "insensitive",
      },
    };
  }

  // Filtro por marca
  if (filters.brand) {
    whereClause.marca = {
      nombre: {
        equals: filters.brand,
        mode: "insensitive",
      },
    };
  }

  // Construir filtros de modelo (pueden combinarse)
  const modeloFilters: Prisma.ModeloWhereInput = {};
  if (filters.model) {
    modeloFilters.nombre = {
      equals: filters.model,
      mode: "insensitive",
    };
  }
  if (filters.storage) {
    modeloFilters.almacenamiento = {
      equals: filters.storage,
      mode: "insensitive",
    };
  }
  if (filters.color) {
    modeloFilters.color = {
      equals: filters.color,
      mode: "insensitive",
    };
  }
  if (Object.keys(modeloFilters).length > 0) {
    whereClause.modelo = modeloFilters;
  }

  // Construir filtros de productosDetalles (pueden combinarse con AND)
  const detallesFilters: Prisma.ProductoDetalleWhereInput[] = [];
  if (filters.imei) {
    detallesFilters.push({
      estado: true,
      imei: {
        contains: filters.imei,
        mode: "insensitive",
      },
    });
  }
  if (filters.supplier) {
    detallesFilters.push({
      estado: true,
      movimientoInventario: {
        some: {
          proveedor: {
            nombre: {
              equals: filters.supplier,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }
  if (detallesFilters.length > 0) {
    whereClause.productosDetalles = {
      some: {
        AND: detallesFilters,
      },
    };
  }

  // Obtener productos con relaciones necesarias
  const products = await prisma.producto.findMany({
    where: whereClause,
    include: {
      tipoProducto: true,
      marca: true,
      modelo: true,
      productosDetalles: {
        where: {
          estado: true,
        },
      },
    },
    orderBy: {
      marca: {
        nombre: "asc",
      },
    },
    take: limit,
    skip: offset,
  });

  // Agregar datos por producto
  const aggregated: AggregatedProductData[] = products.map((product) => {
    const nombreParts = [
      product.marca?.nombre,
      product.modelo?.nombre,
      product.modelo?.almacenamiento,
      product.modelo?.color,
    ]
      .filter(Boolean)
      .join(" ");

    const nombre = nombreParts || product.descripcion || "Producto sin nombre";
    const cantidad = product.cantidad ?? 0;
    const pvp = product.pvp ? Number(product.pvp) : 0;
    const costo = product.costo ? Number(product.costo) : 0;
    const categoria = product.tipoProducto?.nombre || "";

    return {
      id: product.id,
      nombre,
      cantidad,
      pvp,
      costo,
      categoria,
    };
  });

  // Aplicar filtros numéricos y de estado en memoria (después de agregar)
  let filtered = aggregated;

  // Filtro por estado
  if (filters.status) {
    const statusLower = filters.status.toLowerCase();
    filtered = filtered.filter((p) => {
      const productStatus = calculateStatus(p.cantidad);
      return productStatus.toLowerCase() === statusLower;
    });
  }

  // Filtro por costo
  const costFilter = parseNumericFilter(filters.cost);
  if (costFilter) {
    filtered = filtered.filter((p) => {
      switch (costFilter.operator) {
        case ">=":
          return p.costo >= costFilter.value;
        case "<=":
          return p.costo <= costFilter.value;
        case "=":
          return p.costo === costFilter.value;
        default:
          return true;
      }
    });
  }

  // Filtro por cantidad
  const quantityFilter = parseNumericFilter(filters.quantity);
  if (quantityFilter) {
    filtered = filtered.filter((p) => {
      switch (quantityFilter.operator) {
        case ">=":
          return p.cantidad >= quantityFilter.value;
        case "<=":
          return p.cantidad <= quantityFilter.value;
        case "=":
          return p.cantidad === quantityFilter.value;
        default:
          return true;
      }
    });
  }

  return filtered;
}

// Contar productos con filtros aplicados
export async function getFilteredProductDetailsCount(
  filters: InventoryFilters = {},
): Promise<number> {
  const whereClause: Prisma.ProductoWhereInput = {
    estado: true,
  };

  // Aplicar los mismos filtros que en getFilteredProductDetails
  if (filters.category) {
    whereClause.tipoProducto = {
      nombre: {
        equals: filters.category,
        mode: "insensitive",
      },
    };
  }

  if (filters.brand) {
    whereClause.marca = {
      nombre: {
        equals: filters.brand,
        mode: "insensitive",
      },
    };
  }

  // Construir filtros de modelo (pueden combinarse)
  const modeloFilters: Prisma.ModeloWhereInput = {};
  if (filters.model) {
    modeloFilters.nombre = {
      equals: filters.model,
      mode: "insensitive",
    };
  }
  if (filters.storage) {
    modeloFilters.almacenamiento = {
      equals: filters.storage,
      mode: "insensitive",
    };
  }
  if (filters.color) {
    modeloFilters.color = {
      equals: filters.color,
      mode: "insensitive",
    };
  }
  if (Object.keys(modeloFilters).length > 0) {
    whereClause.modelo = modeloFilters;
  }

  // Construir filtros de productosDetalles (pueden combinarse con AND)
  const detallesFilters: Prisma.ProductoDetalleWhereInput[] = [];
  if (filters.imei) {
    detallesFilters.push({
      estado: true,
      imei: {
        contains: filters.imei,
        mode: "insensitive",
      },
    });
  }
  if (filters.supplier) {
    detallesFilters.push({
      estado: true,
      movimientoInventario: {
        some: {
          proveedor: {
            nombre: {
              equals: filters.supplier,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }
  if (detallesFilters.length > 0) {
    whereClause.productosDetalles = {
      some: {
        AND: detallesFilters,
      },
    };
  }

  // Contar productos que cumplen los filtros básicos
  const count = await prisma.producto.count({
    where: whereClause,
  });

  // Nota: Los filtros de status, cost y quantity se aplican después de agregar,
  // por lo que el conteo exacto requeriría aplicar la misma lógica de agregación.
  // Por ahora, retornamos el conteo de productos que cumplen los filtros básicos.
  // Para un conteo más preciso, se podría obtener todos y aplicar los filtros numéricos.
  return count;
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
  // Obtener todas las marcas directamente de la tabla de marcas
  const allBrands = await prisma.marca.findMany({
    select: {
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  // Obtener todas las categorías directamente de la tabla de tipos de producto
  const allCategories = await prisma.tipoProducto.findMany({
    select: {
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  // Obtener modelos con sus atributos
  const allModels = await prisma.modelo.findMany({
    select: {
      nombre: true,
      almacenamiento: true,
      color: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  // Obtener proveedores de movimientos
  const movements = await prisma.movimientoInventario.findMany({
    select: {
      proveedor: {
        select: {
          nombre: true,
        },
      },
    },
    distinct: ["proveedorId"],
  });

  const brands = new Set<string>();
  const categories = new Set<string>();
  const models = new Set<string>();
  const storages = new Set<string>();
  const colors = new Set<string>();
  const suppliers = new Set<string>();

  // Agregar todas las marcas
  for (const brand of allBrands) {
    if (brand.nombre) {
      brands.add(brand.nombre);
    }
  }

  // Agregar todas las categorías
  for (const category of allCategories) {
    if (category.nombre) {
      categories.add(category.nombre);
    }
  }

  // Agregar modelos, almacenamientos y colores
  for (const model of allModels) {
    if (model.nombre) {
      models.add(model.nombre);
    }
    if (model.almacenamiento) {
      storages.add(model.almacenamiento);
    }
    if (model.color) {
      colors.add(model.color);
    }
  }

  // Agregar proveedores
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

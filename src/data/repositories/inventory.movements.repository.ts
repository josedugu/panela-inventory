import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export interface InventoryMovementProductOption {
  id: string;
  label: string;
}

export interface InventoryMovementType {
  id: string;
  nombre: string;
  ingreso: boolean;
  salida: boolean;
}

export type InventoryMovementWithRelations =
  Prisma.MovimientoInventarioGetPayload<{
    include: {
      tipoMovimiento: true;
      bodega: {
        select: {
          id: true;
          nombre: true;
          codigo: true;
        };
      };
      proveedor: {
        select: {
          id: true;
          nombre: true;
        };
      };
      productos: {
        include: {
          producto: {
            include: {
              marca: {
                select: {
                  id: true;
                  nombre: true;
                  descripcion: true;
                  createdAt: true;
                  updatedAt: true;
                };
              };
              modelo: true;
              tipoProducto: true;
            };
          };
          ventaProducto: {
            include: {
              venta: {
                include: {
                  cliente: {
                    select: {
                      id: true;
                      nombre: true;
                    };
                  };
                };
              };
            };
          };
        };
      };
      creadoPor: true;
    };
  }>;

export async function listInventoryMovementProducts(): Promise<
  InventoryMovementProductOption[]
> {
  const products = await prisma.producto.findMany({
    where: {
      estado: true,
    },
    include: {
      marca: true,
      modelo: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) => {
    const parts = [
      product.marca?.nombre,
      product.modelo?.nombre,
      product.modelo?.almacenamiento,
      product.modelo?.ram,
      product.modelo?.color,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      id: product.id,
      label: parts.length > 0 ? parts : (product.descripcion ?? "Producto"),
    };
  });
}

export async function listInventoryMovementTypes(): Promise<
  InventoryMovementType[]
> {
  const types = await prisma.tipoMovimientoInventario.findMany({
    where: {
      nombre: {
        not: undefined,
      },
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return types.map((type) => ({
    id: type.id,
    nombre: type.nombre,
    ingreso: type.ingreso,
    salida: type.salida,
  }));
}

export async function getInventoryMovementTypeById(id: string) {
  return prisma.tipoMovimientoInventario.findUnique({
    where: { id },
  });
}

interface CreateInventoryMovementInput {
  productId: string;
  movementTypeId: string;
  quantity: number;
  unitCost?: number;
  imeis: string[];
  warehouseId?: string;
  supplierId?: string;
  pvp?: number;
  comentario?: string;
  creadoPorId?: string;
}

export async function createInventoryMovementWithDetails({
  productId,
  movementTypeId,
  quantity,
  unitCost,
  imeis,
  warehouseId,
  supplierId,
  pvp,
  comentario,
  creadoPorId,
}: CreateInventoryMovementInput) {
  return prisma.$transaction(async (tx) => {
    const movementType = await tx.tipoMovimientoInventario.findUnique({
      where: { id: movementTypeId },
    });

    if (!movementType) {
      throw new Error("Tipo de movimiento no encontrado");
    }

    const isIngreso = movementType.ingreso;
    const isSalida = movementType.salida;
    const isHorizontal = !isIngreso && !isSalida;

    let actualProductId = productId;
    let product = null;

    // Para movimientos horizontales, obtener el producto desde los IMEIs si no se proporciona
    if (isHorizontal && (!productId || productId.trim() === "")) {
      if (imeis.length === 0) {
        throw new Error(
          "Los IMEIs son requeridos para movimientos horizontales",
        );
      }

      // Buscar el producto desde el primer IMEI
      const firstDetail = await tx.productoDetalle.findFirst({
        where: {
          imei: imeis[0],
          estado: true,
        },
        include: {
          producto: {
            include: {
              modelo: true,
              marca: true,
            },
          },
        },
      });

      if (!firstDetail || !firstDetail.producto) {
        throw new Error(
          `No se encontró un producto activo con el IMEI: ${imeis[0]}`,
        );
      }

      actualProductId = firstDetail.producto.id;
      product = firstDetail.producto;
    } else {
      // Para movimientos normales, obtener el producto normalmente
      product = await tx.producto.findUnique({
        where: { id: actualProductId },
        include: {
          modelo: true,
          marca: true,
        },
      });

      if (!product) {
        throw new Error("Producto no encontrado");
      }
    }

    let productDetailsIds: string[] = [];

    if (isIngreso) {
      // Movimientos de ingreso: crear nuevos detalles
      // Si no hay IMEIs o hay menos IMEIs que cantidad, generar automáticamente
      const { generateImeiIfNeeded } = await import("@/lib/utils-imei");

      const imeisToUse: string[] = [];
      for (let i = 0; i < quantity; i++) {
        if (i < imeis.length && imeis[i]?.trim()) {
          imeisToUse.push(imeis[i].trim());
        } else {
          imeisToUse.push(generateImeiIfNeeded(null));
        }
      }

      const createdDetails = await Promise.all(
        imeisToUse.map((imei) =>
          tx.productoDetalle.create({
            data: {
              productoId: actualProductId,
              imei,
              bodegaId: warehouseId || undefined,
              nombre:
                product.descripcion ??
                product.modelo?.nombre ??
                product.marca?.nombre ??
                "Producto",
            },
          }),
        ),
      );
      productDetailsIds = createdDetails.map((detail) => detail.id);
    } else if (isSalida && imeis.length > 0) {
      // Movimientos de salida: marcar detalles existentes como inactivos
      const existingDetails = await tx.productoDetalle.findMany({
        where: {
          productoId: actualProductId,
          imei: {
            in: imeis,
          },
          estado: true,
        },
      });

      if (existingDetails.length !== imeis.length) {
        throw new Error(
          "Algunos IMEI no están registrados o no están activos para este producto",
        );
      }

      productDetailsIds = existingDetails.map((detail) => detail.id);

      await tx.productoDetalle.updateMany({
        where: {
          id: {
            in: productDetailsIds,
          },
        },
        data: {
          estado: false,
        },
      });
    } else if (isHorizontal && imeis.length > 0) {
      // Movimientos horizontales: solo obtener los detalles existentes (no crear ni marcar como inactivos)
      const existingDetails = await tx.productoDetalle.findMany({
        where: {
          imei: {
            in: imeis,
          },
          estado: true,
        },
      });

      if (existingDetails.length !== imeis.length) {
        throw new Error("Algunos IMEI no están registrados o no están activos");
      }

      // Verificar que todos los IMEIs pertenezcan al mismo producto
      const productIds = new Set(
        existingDetails.map((detail) => detail.productoId),
      );
      if (productIds.size > 1) {
        throw new Error("Todos los IMEIs deben pertenecer al mismo producto");
      }

      productDetailsIds = existingDetails.map((detail) => detail.id);

      // Actualizar la bodega de los detalles si se proporciona warehouseId
      if (warehouseId) {
        await tx.productoDetalle.updateMany({
          where: {
            id: {
              in: productDetailsIds,
            },
          },
          data: {
            bodegaId: warehouseId,
          },
        });
      }
    }

    const movement = await tx.movimientoInventario.create({
      data: {
        cantidad: quantity,
        costoUnitario:
          unitCost !== undefined && unitCost !== null
            ? new Prisma.Decimal(unitCost.toString())
            : null,
        pvp:
          pvp !== undefined && pvp !== null && pvp >= 0
            ? new Prisma.Decimal(pvp.toString())
            : null,
        tipoMovimientoId: movementTypeId,
        bodegaId: warehouseId || null,
        proveedorId: supplierId || null,
        comentario: comentario || null,
        creadoPorId: creadoPorId || null,
        productos:
          productDetailsIds.length > 0
            ? {
                connect: productDetailsIds.map((id) => ({ id })),
              }
            : undefined,
      },
    });

    // Solo actualizar la cantidad del producto si NO es un movimiento horizontal
    if (!isHorizontal) {
      const currentQuantity = product.cantidad ?? 0;
      const updatedQuantity = isIngreso
        ? currentQuantity + quantity
        : currentQuantity - quantity;

      if (updatedQuantity < 0) {
        throw new Error("La cantidad resulta negativa para el producto");
      }

      // Preparar datos de actualización
      const updateData: {
        cantidad: number;
        pvp?: Prisma.Decimal;
      } = {
        cantidad: updatedQuantity,
      };

      // Actualizar PVP solo para movimientos de ingreso si se proporciona
      if (isIngreso && pvp !== undefined && pvp !== null && pvp >= 0) {
        updateData.pvp = new Prisma.Decimal(pvp.toString());
      }

      await tx.producto.update({
        where: { id: actualProductId },
        data: updateData,
      });
    }

    return movement;
  });
}

export async function listInventoryMovements(): Promise<
  InventoryMovementWithRelations[]
> {
  return prisma.movimientoInventario.findMany({
    where: {
      estado: true,
    },
    include: {
      tipoMovimiento: true,
      bodega: {
        select: {
          id: true,
          nombre: true,
          codigo: true,
        },
      },
      proveedor: {
        select: {
          id: true,
          nombre: true,
        },
      },
      productos: {
        include: {
          producto: {
            include: {
              marca: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true,
                  createdAt: true,
                  updatedAt: true,
                  // Excluimos 'pais' porque no existe en la BD
                },
              },
              modelo: true,
              tipoProducto: true,
            },
          },
          ventaProducto: {
            include: {
              venta: {
                include: {
                  cliente: {
                    select: {
                      id: true,
                      nombre: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      creadoPor: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// ============================================
// PAGINATED & FILTERED QUERY (100% DB)
// ============================================

export interface ListMovementsPaginatedFilters {
  search?: string;
  movementType?: string;
  warehouse?: string;
  supplier?: string;
  user?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ListMovementsPaginatedParams {
  page: number;
  pageSize: number;
  filters?: ListMovementsPaginatedFilters;
}

export interface ListMovementsPaginatedResult {
  data: InventoryMovementWithRelations[];
  total: number;
}

export async function listInventoryMovementsPaginated(
  params: ListMovementsPaginatedParams,
): Promise<ListMovementsPaginatedResult> {
  const { page, pageSize, filters } = params;
  const skip = (page - 1) * pageSize;

  // Build dynamic where clause
  const where: Prisma.MovimientoInventarioWhereInput = {
    estado: true,
  };

  // Filter by movement type name
  if (filters?.movementType) {
    where.tipoMovimiento = {
      nombre: {
        equals: filters.movementType,
        mode: "insensitive",
      },
    };
  }

  // Filter by warehouse name
  if (filters?.warehouse) {
    where.bodega = {
      nombre: {
        equals: filters.warehouse,
        mode: "insensitive",
      },
    };
  }

  // Filter by supplier name
  if (filters?.supplier) {
    where.proveedor = {
      nombre: {
        equals: filters.supplier,
        mode: "insensitive",
      },
    };
  }

  // Filter by user (creator) name or email
  if (filters?.user) {
    where.creadoPor = {
      OR: [
        { nombre: { contains: filters.user, mode: "insensitive" } },
        { email: { contains: filters.user, mode: "insensitive" } },
      ],
    };
  }

  // Filter by date range
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      where.createdAt.lte = filters.dateTo;
    }
  }

  // Filter by search term (consecutivo, IMEI, or product details)
  if (filters?.search) {
    const searchTerm = filters.search.trim();
    const searchNumber = Number.parseInt(searchTerm, 10);

    where.OR = [
      // Search by consecutivo if it's a number
      ...(Number.isFinite(searchNumber) ? [{ consecutivo: searchNumber }] : []),
      // Search by IMEI in related products
      {
        productos: {
          some: {
            imei: {
              contains: searchTerm,
              mode: "insensitive" as const,
            },
          },
        },
      },
      // Search by product description/marca/modelo
      {
        productos: {
          some: {
            producto: {
              OR: [
                { descripcion: { contains: searchTerm, mode: "insensitive" } },
                {
                  marca: {
                    nombre: { contains: searchTerm, mode: "insensitive" },
                  },
                },
                {
                  modelo: {
                    nombre: { contains: searchTerm, mode: "insensitive" },
                  },
                },
              ],
            },
          },
        },
      },
      // Search by movement type name
      {
        tipoMovimiento: {
          nombre: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  // Execute count and data queries in parallel
  const [total, data] = await Promise.all([
    prisma.movimientoInventario.count({ where }),
    prisma.movimientoInventario.findMany({
      where,
      include: {
        tipoMovimiento: true,
        bodega: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        proveedor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        productos: {
          include: {
            producto: {
              include: {
                marca: {
                  select: {
                    id: true,
                    nombre: true,
                    descripcion: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
                modelo: true,
                tipoProducto: true,
              },
            },
            ventaProducto: {
              include: {
                venta: {
                  include: {
                    cliente: {
                      select: {
                        id: true,
                        nombre: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        creadoPor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),
  ]);

  return { data, total };
}

export interface InventoryMovementFilterOptions {
  movementTypes: string[];
  products: string[];
  operations: Array<"ingreso" | "salida">;
  users: string[];
  warehouses: string[];
  suppliers: string[];
}

export async function getInventoryMovementFilterOptions(): Promise<InventoryMovementFilterOptions> {
  const [movementTypes, warehouses, suppliers, users] = await Promise.all([
    // Get all movement types
    prisma.tipoMovimientoInventario.findMany({
      select: { nombre: true },
      orderBy: { nombre: "asc" },
    }),
    // Get all warehouses
    prisma.bodega.findMany({
      select: { nombre: true },
      orderBy: { nombre: "asc" },
      where: { estado: true }, // Optional: only show active warehouses
    }),
    // Get all suppliers
    prisma.proveedor.findMany({
      select: { nombre: true },
      orderBy: { nombre: "asc" },
    }),
    // Get all users
    prisma.usuario.findMany({
      select: { nombre: true, email: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return {
    movementTypes: movementTypes.map((t) => t.nombre),
    products: [], // Optimized: Global search handles products now
    operations: ["ingreso", "salida"],
    users: users.map((u) => u.nombre || u.email || "").filter(Boolean),
    warehouses: warehouses.map((w) => w.nombre),
    suppliers: suppliers.map((s) => s.nombre),
  };
}

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

export interface InventoryMovementFilterOptions {
  movementTypes: string[];
  products: string[];
  operations: Array<"ingreso" | "salida">;
  users: string[];
}

export async function getInventoryMovementFilterOptions(): Promise<InventoryMovementFilterOptions> {
  const movements = await prisma.movimientoInventario.findMany({
    select: {
      tipoMovimiento: {
        select: {
          nombre: true,
          ingreso: true,
          salida: true,
        },
      },
      productos: {
        select: {
          producto: {
            select: {
              descripcion: true,
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
          },
        },
      },
      creadoPor: {
        select: {
          nombre: true,
          email: true,
        },
      },
    },
  });

  const movementTypes = new Set<string>();
  const products = new Set<string>();
  const operations = new Set<"ingreso" | "salida">();
  const users = new Set<string>();

  for (const movement of movements) {
    if (movement.tipoMovimiento?.nombre) {
      movementTypes.add(movement.tipoMovimiento.nombre);
      if (movement.tipoMovimiento.ingreso) {
        operations.add("ingreso");
      } else if (movement.tipoMovimiento.salida) {
        operations.add("salida");
      }
    }

    const productCandidate = movement.productos[0]?.producto;
    if (productCandidate) {
      const label = [
        productCandidate.marca?.nombre,
        productCandidate.modelo?.nombre,
        productCandidate.modelo?.almacenamiento,
        productCandidate.modelo?.color,
        productCandidate.descripcion,
      ]
        .filter(Boolean)
        .join(" ");
      if (label.trim().length > 0) {
        products.add(label.trim());
      }
    }

    const userLabel =
      movement.creadoPor?.nombre ?? movement.creadoPor?.email ?? undefined;
    if (userLabel) {
      users.add(userLabel);
    }
  }

  if (operations.size === 0) {
    operations.add("ingreso");
    operations.add("salida");
  }

  const toSorted = <T extends string>(set: Set<T>) =>
    Array.from(set)
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .sort((a, b) => a.localeCompare(b));

  return {
    movementTypes: toSorted(movementTypes),
    products: toSorted(products),
    operations: Array.from(operations),
    users: toSorted(users),
  };
}

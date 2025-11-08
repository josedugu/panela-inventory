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
  unitCost: number;
  imeis: string[];
}

export async function createInventoryMovementWithDetails({
  productId,
  movementTypeId,
  quantity,
  unitCost,
  imeis,
}: CreateInventoryMovementInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.producto.findUnique({
      where: { id: productId },
      include: {
        modelo: true,
        marca: true,
      },
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    const movementType = await tx.tipoMovimientoInventario.findUnique({
      where: { id: movementTypeId },
    });

    if (!movementType) {
      throw new Error("Tipo de movimiento no encontrado");
    }

    const isIngreso = movementType.ingreso;

    let productDetailsIds: string[] = [];

    if (imeis.length > 0) {
      if (isIngreso) {
        const createdDetails = await Promise.all(
          imeis.map((imei) =>
            tx.productoDetalle.create({
              data: {
                productoId: productId,
                imei,
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
      } else {
        const existingDetails = await tx.productoDetalle.findMany({
          where: {
            productoId: productId,
            imei: {
              in: imeis,
            },
          },
        });

        if (existingDetails.length !== imeis.length) {
          throw new Error(
            "Algunos IMEI no están registrados para este producto",
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
      }
    }

    const movement = await tx.movimientoInventario.create({
      data: {
        cantidad: quantity,
        costoUnitario: new Prisma.Decimal(unitCost.toString()),
        tipoMovimientoId: movementTypeId,
        productos:
          productDetailsIds.length > 0
            ? {
                connect: productDetailsIds.map((id) => ({ id })),
              }
            : undefined,
      },
    });

    const currentQuantity = product.cantidad ?? 0;
    const updatedQuantity = isIngreso
      ? currentQuantity + quantity
      : currentQuantity - quantity;

    if (updatedQuantity < 0) {
      throw new Error("La cantidad resulta negativa para el producto");
    }

    await tx.producto.update({
      where: { id: productId },
      data: {
        cantidad: updatedQuantity,
      },
    });

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

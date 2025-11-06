import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export type SaleWithRelations = Prisma.VentaGetPayload<{
  include: {
    cliente: true;
    vendidoPor: true;
  };
}>;

export async function listSales(): Promise<SaleWithRelations[]> {
  return prisma.venta.findMany({
    where: {
      estado: true,
    },
    include: {
      cliente: true,
      vendidoPor: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export interface SalesFilterOptions {
  statuses: string[];
  sellers: string[];
  clients: string[];
}

export type SaleWithFullDetails = Prisma.VentaGetPayload<{
  include: {
    cliente: true;
    vendidoPor: true;
    ventaProducto: {
      include: {
        productosDetalles: {
          include: {
            producto: {
              select: {
                id: true;
                descripcion: true;
                marca: {
                  select: {
                    nombre: true;
                  };
                };
                modelo: {
                  select: {
                    nombre: true;
                    almacenamiento: true;
                    color: true;
                  };
                };
                almacenamiento: {
                  select: {
                    capacidad: true;
                  };
                };
                color: {
                  select: {
                    nombre: true;
                  };
                };
              };
            };
          };
        };
      };
    };
  };
}>;

export async function getSaleById(
  saleId: string,
): Promise<SaleWithFullDetails | null> {
  return prisma.venta.findUnique({
    where: { id: saleId },
    include: {
      cliente: true,
      vendidoPor: true,
      ventaProducto: {
        include: {
          productosDetalles: {
            include: {
              producto: {
                select: {
                  id: true,
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
                  almacenamiento: {
                    select: {
                      capacidad: true,
                    },
                  },
                  color: {
                    select: {
                      nombre: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getSalesFilterOptions(): Promise<SalesFilterOptions> {
  const sales = await prisma.venta.findMany({
    where: {
      estado: true,
    },
    select: {
      estado: true,
      cliente: {
        select: {
          nombre: true,
        },
      },
      vendidoPor: {
        select: {
          nombre: true,
          email: true,
        },
      },
    },
  });

  const sellers = new Set<string>();
  const clients = new Set<string>();

  for (const sale of sales) {
    const sellerLabel =
      sale.vendidoPor?.nombre ?? sale.vendidoPor?.email ?? undefined;
    if (sellerLabel) {
      sellers.add(sellerLabel);
    }

    if (sale.cliente?.nombre) {
      clients.add(sale.cliente.nombre);
    }
  }

  const toSorted = (set: Set<string>) =>
    Array.from(set)
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .sort((a, b) => a.localeCompare(b));

  return {
    statuses: [],
    sellers: toSorted(sellers),
    clients: toSorted(clients),
  };
}

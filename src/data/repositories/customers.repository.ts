import "server-only";

import { prisma } from "@/lib/prisma/client";

export type CustomerWithTotalSales = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  whatsapp: string | null;
  totalVentas: number;
};

export async function listCustomers(): Promise<CustomerWithTotalSales[]> {
  const customers = await prisma.cliente.findMany({
    orderBy: {
      nombre: "asc",
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      telefono: true,
      whatsapp: true,
      venta: {
        select: {
          total: true,
        },
      },
    },
  });

  return customers.map((customer) => {
    const totalVentas = customer.venta.reduce(
      (sum, venta) => sum + Number(venta.total),
      0,
    );

    return {
      id: customer.id,
      nombre: customer.nombre,
      email: customer.email,
      telefono: customer.telefono,
      whatsapp: customer.whatsapp,
      totalVentas,
    };
  });
}

export async function createCustomer(data: {
  nombre: string;
  email: string;
  telefono?: string;
  whatsapp?: string;
  direccion?: string;
}) {
  return prisma.cliente.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono ?? null,
      whatsapp: data.whatsapp ?? null,
      direccion: data.direccion ?? null,
    },
  });
}

export async function updateCustomer(
  id: string,
  data: {
    nombre?: string;
    email?: string;
    telefono?: string;
    whatsapp?: string;
    direccion?: string;
  },
) {
  return prisma.cliente.update({
    where: { id },
    data: {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono ?? null,
      whatsapp: data.whatsapp ?? null,
      direccion: data.direccion ?? null,
    },
  });
}

export async function deleteCustomer(id: string) {
  return prisma.cliente.delete({
    where: { id },
  });
}

export type CustomerSaleWithDetails = {
  id: string;
  consecutivo: number;
  total: number;
  estado: boolean;
  createdAt: Date;
  ventaProducto: Array<{
    id: string;
    cantidad: number;
    precio: number;
    descuento: number;
    subtotal: number;
    total: number;
    productosDetalles: Array<{
      id: string;
      nombre: string | null;
      producto: {
        id: string;
        descripcion: string | null;
        costo: number | null;
        marca: {
          nombre: string;
        } | null;
        modelo: {
          nombre: string;
          almacenamiento: string | null;
          color: string | null;
        } | null;
        almacenamiento: {
          capacidad: number;
        } | null;
        color: {
          nombre: string;
        } | null;
      };
    }>;
  }>;
};

export async function getCustomerSalesWithDetails(
  clienteId: string,
): Promise<CustomerSaleWithDetails[]> {
  const ventas = await prisma.venta.findMany({
    where: {
      clienteId,
    },
    include: {
      ventaProducto: {
        include: {
          productosDetalles: {
            include: {
              producto: {
                include: {
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
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convertir Decimal a number para serialización
  return ventas.map((venta) => ({
    id: venta.id,
    consecutivo: venta.consecutivo,
    total: Number(venta.total),
    estado: venta.estado,
    createdAt: venta.createdAt,
    ventaProducto: venta.ventaProducto.map((vp) => ({
      id: vp.id,
      cantidad: vp.cantidad,
      precio: Number(vp.precio),
      descuento: Number(vp.descuento),
      subtotal: Number(vp.subtotal),
      total: Number(vp.total),
      productosDetalles: vp.productosDetalles.map((pd) => ({
        id: pd.id,
        nombre: pd.nombre,
        producto: {
          id: pd.producto.id,
          descripcion: pd.producto.descripcion,
          costo: pd.producto.costo ? Number(pd.producto.costo) : null,
          marca: pd.producto.marca,
          modelo: pd.producto.modelo,
          almacenamiento: pd.producto.almacenamiento,
          color: pd.producto.color,
        },
      })),
    })),
  }));
}

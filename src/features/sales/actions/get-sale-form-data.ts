"use server";

import { listCustomers } from "@/data/repositories/customers.repository";
import { prisma } from "@/lib/prisma/client";

interface SaleProductOption {
  id: string;
  label: string;
  pvp: number;
  availableQuantity: number;
}

interface SaleCustomerOption {
  id: string;
  label: string;
}

export interface SaleFormData {
  products: SaleProductOption[];
  customers: SaleCustomerOption[];
}

export async function getSaleFormData(): Promise<SaleFormData> {
  const [products, customers] = await Promise.all([
    // Obtener solo productos activos con cantidad > 0
    prisma.producto.findMany({
      where: {
        estado: true,
        cantidad: {
          gt: 0,
        },
      },
      select: {
        id: true,
        nombre: true,
        pvp: true,
        cantidad: true,
      },
      orderBy: {
        nombre: "asc",
      },
    }),
    listCustomers(),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      label: product.nombre ?? "Producto sin nombre",
      pvp: product.pvp ? Number(product.pvp) : 0,
      availableQuantity: product.cantidad ?? 0,
    })),
    customers: customers.map((customer) => {
      const nombre =
        customer.nombre ?? customer.email ?? "Cliente sin información";
      const cedula = customer.cedula;
      const label = cedula ? `${nombre} - ${cedula}` : nombre;
      return {
        id: customer.id,
        label,
      };
    }),
  };
}

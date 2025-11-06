"use server";

import { listCustomers } from "@/data/repositories/customers.repository";
import {
  getAllProducts,
  type ProductWithRelations,
} from "@/data/repositories/products.repository";

interface SaleProductOption {
  id: string;
  label: string;
  cost: number;
  availableQuantity: number;
  discount?: {
    name?: string;
    amount: number;
  };
}

interface SaleCustomerOption {
  id: string;
  label: string;
}

export interface SaleFormData {
  products: SaleProductOption[];
  customers: SaleCustomerOption[];
}

function mapProduct(product: ProductWithRelations): SaleProductOption {
  const label = [
    product.marca?.nombre,
    product.modelo?.nombre,
    product.modelo?.almacenamiento,
    product.modelo?.color,
    product.descripcion,
  ]
    .filter(Boolean)
    .join(" ");

  const cost = product.costo ? Number(product.costo) : 0;
  const discountRecord = product.productoDescuento?.find(
    (discount) => discount.estado,
  );

  const discount = discountRecord
    ? {
        name: discountRecord.nombre ?? undefined,
        amount: Number(discountRecord.descuento),
      }
    : undefined;

  return {
    id: product.id,
    label: label.trim().length > 0 ? label : "Producto sin descripción",
    cost,
    availableQuantity: product.cantidad ?? 0,
    discount,
  };
}

export async function getSaleFormData(): Promise<SaleFormData> {
  const [products, customers] = await Promise.all([
    getAllProducts(),
    listCustomers(),
  ]);

  return {
    products: products.map(mapProduct),
    customers: customers.map((customer) => ({
      id: customer.id,
      label: customer.nombre ?? customer.email ?? "Cliente sin información",
    })),
  };
}

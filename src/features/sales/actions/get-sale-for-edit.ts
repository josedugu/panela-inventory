"use server";

import { randomUUID } from "node:crypto";
import { getSaleById } from "@/data/repositories/sales.repository";

export type SaleLineForEdit = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type SaleForEditDTO = {
  clienteId: string;
  lines: SaleLineForEdit[];
};

export interface GetSaleForEditSuccess {
  success: true;
  data: SaleForEditDTO;
}

export interface GetSaleForEditError {
  success: false;
  error: string;
}

export type GetSaleForEditResult = GetSaleForEditSuccess | GetSaleForEditError;

export async function getSaleForEditAction(
  saleId: string,
): Promise<GetSaleForEditResult> {
  try {
    const sale = await getSaleById(saleId);

    if (!sale) {
      return {
        success: false,
        error: "Venta no encontrada",
      };
    }

    const clienteId = sale.cliente?.id ?? "";

    // Convertir ventaProducto a líneas editables
    // Cada ventaProducto puede tener múltiples productosDetalles
    // Agrupamos por producto y precio para crear las líneas
    const lines: SaleLineForEdit[] = [];

    for (const ventaProducto of sale.ventaProducto) {
      const precio = Number(ventaProducto.precio);

      // Agrupar productosDetalles por productoId
      const productosPorId = new Map<string, number>();

      for (const productoDetalle of ventaProducto.productosDetalles) {
        const productoId = productoDetalle.producto.id;
        const cantidadActual = productosPorId.get(productoId) ?? 0;
        productosPorId.set(productoId, cantidadActual + 1);
      }

      // Crear una línea por cada producto único
      for (const [productoId, cantidad] of productosPorId.entries()) {
        lines.push({
          id: randomUUID(),
          productId: productoId,
          quantity: cantidad,
          unitPrice: precio,
        });
      }
    }

    return {
      success: true,
      data: {
        clienteId,
        lines: lines.length > 0 ? lines : [],
      },
    };
  } catch {
    return {
      success: false,
      error: "No se pudieron obtener los datos de la venta para editar",
    };
  }
}

"use server";

import {
  getSaleById,
  type SaleWithFullDetails,
} from "@/data/repositories/sales.repository";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "short",
  timeStyle: "short",
});

export type SaleProductDetailDTO = {
  id: string;
  nombre: string | null;
  imei: string | null;
  descuento: number;
  descuentoFormatted: string;
  precio: number;
  precioFormatted: string;
  total: number;
  totalFormatted: string;
  productoNombre: string;
};

export type SaleDetailsDTO = {
  id: string;
  consecutivo: number;
  cliente: string | null;
  fecha: string;
  fechaLabel: string;
  montoTotal: number;
  montoTotalFormatted: string;
  cantidadEquipos: number;
  vendedor: string | null;
  productos: SaleProductDetailDTO[];
};

function getProductName(producto: {
  marca: { nombre: string } | null;
  modelo: {
    nombre: string;
    almacenamiento: string | null;
    color: string | null;
  } | null;
  almacenamiento: { capacidad: number } | null;
  color: { nombre: string } | null;
  descripcion: string | null;
}): string {
  const parts: string[] = [];

  if (producto.marca) {
    parts.push(producto.marca.nombre);
  }

  if (producto.modelo) {
    parts.push(producto.modelo.nombre);
    if (producto.modelo.almacenamiento) {
      parts.push(producto.modelo.almacenamiento);
    }
    if (producto.modelo.color) {
      parts.push(producto.modelo.color);
    }
  }

  if (producto.almacenamiento) {
    parts.push(String(producto.almacenamiento.capacidad));
  }

  if (producto.color) {
    parts.push(producto.color.nombre);
  }

  if (producto.descripcion) {
    parts.push(producto.descripcion);
  }

  return parts.filter(Boolean).join(" ") || "Producto sin nombre";
}

function normalizeSaleDetails(sale: SaleWithFullDetails): SaleDetailsDTO {
  const cliente = sale.cliente?.nombre ?? null;
  const vendedor = sale.vendidoPor?.nombre ?? sale.vendidoPor?.email ?? null;

  const fecha = sale.createdAt.toISOString();
  const fechaLabel = dateTimeFormatter.format(sale.createdAt);

  const montoTotal = Number(sale.total);
  const montoTotalFormatted = currencyFormatter.format(montoTotal);

  // Contar cantidad de equipos (productosDetalles)
  let cantidadEquipos = 0;
  const productos: SaleProductDetailDTO[] = [];

  for (const ventaProducto of sale.ventaProducto) {
    const precio = Number(ventaProducto.precio);
    const descuento = Number(ventaProducto.descuento);
    const total = Number(ventaProducto.total);

    for (const productoDetalle of ventaProducto.productosDetalles) {
      cantidadEquipos++;
      const productoNombre = getProductName(productoDetalle.producto);

      productos.push({
        id: productoDetalle.id,
        nombre: productoDetalle.nombre ?? productoNombre,
        imei: productoDetalle.imei,
        descuento,
        descuentoFormatted: currencyFormatter.format(descuento),
        precio,
        precioFormatted: currencyFormatter.format(precio),
        total,
        totalFormatted: currencyFormatter.format(total),
        productoNombre,
      });
    }
  }

  return {
    id: sale.id,
    consecutivo: sale.consecutivo,
    cliente,
    fecha,
    fechaLabel,
    montoTotal,
    montoTotalFormatted,
    cantidadEquipos,
    vendedor,
    productos,
  };
}

export interface GetSaleDetailsSuccess {
  success: true;
  data: SaleDetailsDTO;
}

export interface GetSaleDetailsError {
  success: false;
  error: string;
}

export type GetSaleDetailsResult = GetSaleDetailsSuccess | GetSaleDetailsError;

export async function getSaleDetailsAction(
  saleId: string,
): Promise<GetSaleDetailsResult> {
  try {
    const sale = await getSaleById(saleId);

    if (!sale) {
      return {
        success: false,
        error: "Venta no encontrada",
      };
    }

    const normalized = normalizeSaleDetails(sale);

    return {
      success: true,
      data: normalized,
    };
  } catch {
    return {
      success: false,
      error: "No se pudieron obtener los detalles de la venta",
    };
  }
}

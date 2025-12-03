"use server";

import { prisma } from "@/lib/prisma/client";
import { formatImeiForDisplay } from "@/lib/utils-imei";

export async function searchProductsAction(query: string) {
  // Buscar solo por IMEI en productoDetalle
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  // Buscar productoDetalle por IMEI
  const productoDetalles = await prisma.productoDetalle.findMany({
    where: {
      estado: true,
      ventaProductoId: null, // Solo disponibles (sin venta asignada)
      imei: {
        contains: trimmedQuery,
        mode: "insensitive",
      },
    },
    include: {
      producto: {
        select: {
          id: true,
          nombre: true,
          costo: true,
          pvp: true,
          precioOferta: true,
          cantidad: true,
          estado: true,
          tipoProducto: {
            select: {
              productoBaseParaOferta: true,
            },
          },
        },
      },
    },
    take: 10,
  });

  // Filtrar solo productos activos con cantidad > 0
  const filtered = productoDetalles.filter(
    (detalle) =>
      detalle.producto.estado === true && (detalle.producto.cantidad ?? 0) > 0,
  );

  return filtered.map((detalle) => {
    const imeiFormatted = formatImeiForDisplay(detalle.imei);
    const productoNombre = detalle.producto.nombre ?? "Producto sin nombre";
    const label = `${imeiFormatted} - ${productoNombre}`;

    return {
      id: detalle.producto.id,
      productoDetalleId: detalle.id,
      imei: detalle.imei,
      label,
      costo: detalle.producto.costo ? Number(detalle.producto.costo) : 0,
      pvp: detalle.producto.pvp ? Number(detalle.producto.pvp) : 0,
      precioOferta: detalle.producto.precioOferta
        ? Number(detalle.producto.precioOferta)
        : null,
      esProductoBase:
        detalle.producto.tipoProducto?.productoBaseParaOferta ?? false,
      availableQuantity: detalle.producto.cantidad ?? 0,
    };
  });
}

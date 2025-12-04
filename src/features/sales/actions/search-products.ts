"use server";

import { prisma } from "@/lib/prisma/client";
import { formatImeiForDisplay } from "@/lib/utils-imei";

export async function searchProductsAction(query: string) {
  // Buscar por IMEI en productoDetalle y por nombre en producto
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
      bodega: {
        select: {
          nombre: true,
        },
      },
    },
    take: 10,
  });

  // Buscar productoDetalle por nombre del producto (para accesorios sin IMEI)
  // Esto busca detalles disponibles cuyo producto tenga el nombre que coincide
  const productoDetallesPorNombre = await prisma.productoDetalle.findMany({
    where: {
      estado: true,
      ventaProductoId: null, // Solo disponibles (sin venta asignada)
      producto: {
        estado: true,
        cantidad: {
          gt: 0,
        },
        nombre: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
      // Excluir los que ya se encontraron por IMEI
      NOT: {
        id: {
          in: productoDetalles.map((d) => d.id),
        },
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
      bodega: {
        select: {
          nombre: true,
        },
      },
    },
    take: 10,
  });

  // Filtrar solo productos activos con cantidad > 0 de los detalles
  const filteredDetalles = productoDetalles.filter(
    (detalle) =>
      detalle.producto.estado === true && (detalle.producto.cantidad ?? 0) > 0,
  );

  const filteredDetallesPorNombre = productoDetallesPorNombre.filter(
    (detalle) =>
      detalle.producto.estado === true && (detalle.producto.cantidad ?? 0) > 0,
  );

  // Mapear resultados de búsqueda por IMEI
  const resultadosPorImei = filteredDetalles.map((detalle) => {
    const imeiFormatted = formatImeiForDisplay(detalle.imei);
    const productoNombre = detalle.producto.nombre ?? "Producto sin nombre";
    const bodegaNombre = detalle.bodega?.nombre ?? "";
    const label = bodegaNombre
      ? `${imeiFormatted} - ${productoNombre} - ${bodegaNombre}`
      : `${imeiFormatted} - ${productoNombre}`;

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

  // Obtener IDs de productos ya encontrados por IMEI para evitar duplicados
  const productosIdsEncontrados = new Set(resultadosPorImei.map((r) => r.id));

  // Mapear resultados de búsqueda por nombre (excluyendo duplicados)
  const resultadosPorNombre = filteredDetallesPorNombre
    .filter((detalle) => !productosIdsEncontrados.has(detalle.producto.id))
    .map((detalle) => {
      const productoNombre = detalle.producto.nombre ?? "Producto sin nombre";
      const bodegaNombre = detalle.bodega?.nombre ?? "";
      // Formato: imei - nombre - bodega (o nombre - bodega si no hay IMEI)
      let label = productoNombre;
      if (detalle.imei) {
        label = `${formatImeiForDisplay(detalle.imei)} - ${label}`;
      }
      if (bodegaNombre) {
        label = `${label} - ${bodegaNombre}`;
      }

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

  // Combinar resultados: primero los de IMEI, luego los de nombre
  return [...resultadosPorImei, ...resultadosPorNombre];
}

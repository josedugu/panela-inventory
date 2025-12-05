"use server";

import { prisma } from "@/lib/prisma/client";

export interface ProductTimelineEvent {
  id: string;
  date: Date;
  type: string;
  quantity: number;
  bodega: string;
  user: string;
  comment?: string;
  isInput: boolean;
}

interface GetProductTimelineResult {
  success: boolean;
  data?: ProductTimelineEvent[];
  productName?: string;
  imei?: string;
  error?: string;
}

export async function getProductTimelineAction(
  productDetailId: string,
): Promise<GetProductTimelineResult> {
  try {
    const productDetail = await prisma.productoDetalle.findUnique({
      where: { id: productDetailId },
      include: {
        producto: true,
        movimientoInventario: {
          include: {
            tipoMovimiento: true,
            bodega: true,
            creadoPor: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!productDetail) {
      return {
        success: false,
        error: "Detalle de producto no encontrado",
      };
    }

    const events: ProductTimelineEvent[] =
      productDetail.movimientoInventario.map((mov) => ({
        id: mov.id,
        date: mov.createdAt,
        type: mov.tipoMovimiento?.nombre || "Movimiento",
        quantity: mov.cantidad,
        bodega: mov.bodega?.nombre || "Sin bodega",
        user: mov.creadoPor?.nombre || "Sistema",
        comment: mov.comentario || undefined,
        isInput: mov.tipoMovimiento?.ingreso || false,
      }));

    return {
      success: true,
      data: events,
      productName: productDetail.producto.nombre || "Producto",
      imei: productDetail.imei || undefined,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Error al obtener el historial del producto",
    };
  }
}

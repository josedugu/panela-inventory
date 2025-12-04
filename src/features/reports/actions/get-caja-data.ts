"use server";

import { prisma } from "@/lib/prisma/client";

export interface PaymentHistoryItem {
  id: string;
  cantidad: number;
  metodoPago: string;
  ventaId: string;
  ventaConsecutivo: number;
  ventaTotal: number;
  clienteNombre: string | null;
  ventaCreatedAt: Date;
  createdAt: Date;
  consecutivo: number | null;
}

export interface TotalPorMetodoPago {
  metodoPago: string;
  total: number;
}

export interface CajaData {
  totalVentas: number;
  totalPagos: number;
  diferencia: number;
  pagos: PaymentHistoryItem[];
  totalesPorMetodoPago: TotalPorMetodoPago[];
  fechaDesde: Date;
  fechaHasta: Date;
}

interface GetCajaDataSuccess {
  success: true;
  data: CajaData;
}

interface GetCajaDataError {
  success: false;
  error: string;
}

export type GetCajaDataResult = GetCajaDataSuccess | GetCajaDataError;

/**
 * Obtiene los datos de caja para un rango de fechas
 * @param fechaDesde - Fecha inicial del rango (por defecto: día actual)
 * @param fechaHasta - Fecha final del rango (por defecto: día actual)
 */
export async function getCajaDataAction(
  fechaDesde?: Date | string,
  fechaHasta?: Date | string,
): Promise<GetCajaDataResult> {
  try {
    // Normalizar las fechas
    let fechaInicio: Date;
    let fechaFin: Date;

    if (!fechaDesde) {
      fechaInicio = new Date();
    } else if (typeof fechaDesde === "string") {
      // Si viene como string en formato YYYY-MM-DD, parsear correctamente
      const [year, month, day] = fechaDesde.split("-").map(Number);
      fechaInicio = new Date(year, month - 1, day);
    } else {
      fechaInicio = fechaDesde;
    }

    if (!fechaHasta) {
      fechaFin = new Date();
    } else if (typeof fechaHasta === "string") {
      // Si viene como string en formato YYYY-MM-DD, parsear correctamente
      const [year, month, day] = fechaHasta.split("-").map(Number);
      fechaFin = new Date(year, month - 1, day);
    } else {
      fechaFin = fechaHasta;
    }

    // Establecer inicio del día inicial en hora local (00:00:00.000)
    const startOfDay = new Date(fechaInicio);
    startOfDay.setHours(0, 0, 0, 0);

    // Establecer fin del día final en hora local (23:59:59.999)
    const endOfDay = new Date(fechaFin);
    endOfDay.setHours(23, 59, 59, 999);

    // Obtener todas las ventas del día
    const ventas = await prisma.venta.findMany({
      where: {
        estado: true,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        total: true,
        consecutivo: true,
        createdAt: true,
      },
    });

    // Calcular total de ventas
    const totalVentas = ventas.reduce((sum, venta) => {
      return sum + Number(venta.total);
    }, 0);

    // Obtener todos los pagos del día con información relacionada
    const pagos = await prisma.pago.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        metodoPago: {
          select: {
            nombre: true,
          },
        },
        venta: {
          select: {
            id: true,
            consecutivo: true,
            total: true,
            createdAt: true,
            cliente: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calcular total de pagos
    const totalPagos = pagos.reduce((sum, pago) => {
      return sum + Number(pago.cantidad);
    }, 0);

    // Calcular totales por método de pago
    const totalesPorMetodo = new Map<string, number>();
    for (const pago of pagos) {
      const metodoNombre = pago.metodoPago.nombre;
      const cantidad = Number(pago.cantidad);
      const totalActual = totalesPorMetodo.get(metodoNombre) || 0;
      totalesPorMetodo.set(metodoNombre, totalActual + cantidad);
    }

    // Convertir a array y filtrar los que tienen total > 0, ordenar por nombre
    const totalesPorMetodoPago: TotalPorMetodoPago[] = Array.from(
      totalesPorMetodo.entries(),
    )
      .filter(([, total]) => total > 0)
      .map(([metodoPago, total]) => ({
        metodoPago,
        total,
      }))
      .sort((a, b) => a.metodoPago.localeCompare(b.metodoPago));

    // Mapear pagos a formato simplificado
    const pagosMapeados: PaymentHistoryItem[] = pagos.map((pago) => ({
      id: pago.id,
      cantidad: Number(pago.cantidad),
      metodoPago: pago.metodoPago.nombre,
      ventaId: pago.venta.id,
      ventaConsecutivo: pago.venta.consecutivo,
      ventaTotal: Number(pago.venta.total),
      clienteNombre: pago.venta.cliente?.nombre ?? null,
      ventaCreatedAt: pago.venta.createdAt,
      createdAt: pago.createdAt,
      consecutivo: pago.consecutivo ?? null,
    }));

    const diferencia = totalVentas - totalPagos;

    return {
      success: true,
      data: {
        totalVentas,
        totalPagos,
        diferencia,
        pagos: pagosMapeados,
        totalesPorMetodoPago,
        fechaDesde: fechaInicio,
        fechaHasta: fechaFin,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener los datos de caja",
    };
  }
}

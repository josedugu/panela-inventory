"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, DollarSign, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatPrice } from "@/lib/utils";
import type {
  PaymentHistoryItem,
  TotalPorMetodoPago,
} from "../actions/get-caja-data";

interface CajaAdminViewProps {
  totalVentas: number;
  totalPagos: number;
  diferencia: number;
  pagos: PaymentHistoryItem[];
  totalesPorMetodoPago: TotalPorMetodoPago[];
}

interface GroupedPayment {
  ventaId: string;
  ventaConsecutivo: number;
  ventaTotal: number;
  clienteNombre: string | null;
  ventaCreatedAt: Date;
  pagos: PaymentHistoryItem[];
  totalPagos: number;
}

interface PaymentTableRow {
  id: string;
  venta: string;
  fechaVenta: string;
  cliente: string;
  metodoPago: string;
  cantidad: number;
  ventaTotal: number;
  totalPagosVenta: number;
  esHeader: boolean;
  ventaId: string;
  consecutivo: number | null;
}

export function CajaAdminView({
  totalVentas,
  totalPagos,
  diferencia,
  pagos,
  totalesPorMetodoPago,
}: CajaAdminViewProps) {
  // Agrupar pagos por venta
  const pagosAgrupados = useMemo<GroupedPayment[]>(() => {
    const grouped = new Map<string, GroupedPayment>();

    for (const pago of pagos) {
      if (!grouped.has(pago.ventaId)) {
        grouped.set(pago.ventaId, {
          ventaId: pago.ventaId,
          ventaConsecutivo: pago.ventaConsecutivo,
          ventaTotal: pago.ventaTotal,
          clienteNombre: pago.clienteNombre,
          ventaCreatedAt: pago.ventaCreatedAt,
          pagos: [],
          totalPagos: 0,
        });
      }

      const grupo = grouped.get(pago.ventaId)!;
      grupo.pagos.push(pago);
      grupo.totalPagos += pago.cantidad;
    }

    return Array.from(grouped.values()).sort(
      (a, b) => b.ventaCreatedAt.getTime() - a.ventaCreatedAt.getTime(),
    );
  }, [pagos]);

  // Crear filas para la tabla agrupadas por venta
  const tableRows = useMemo<PaymentTableRow[]>(() => {
    const rows: PaymentTableRow[] = [];

    for (const grupo of pagosAgrupados) {
      // Fila header de la venta
      rows.push({
        id: `header-${grupo.ventaId}`,
        venta: `#${grupo.ventaConsecutivo}`,
        fechaVenta: format(grupo.ventaCreatedAt, "d/M/yyyy HH:mm", {
          locale: es,
        }),
        cliente: grupo.clienteNombre || "Sin cliente",
        metodoPago: `${grupo.pagos.length} pago${grupo.pagos.length > 1 ? "s" : ""}`,
        cantidad: grupo.totalPagos,
        ventaTotal: grupo.ventaTotal,
        totalPagosVenta: grupo.totalPagos,
        esHeader: true,
        ventaId: grupo.ventaId,
        consecutivo: null,
      });

      // Filas de cada pago
      for (const pago of grupo.pagos) {
        rows.push({
          id: pago.id,
          venta: "",
          fechaVenta: format(pago.createdAt, "HH:mm", { locale: es }),
          cliente: "",
          metodoPago: pago.metodoPago,
          cantidad: pago.cantidad,
          ventaTotal: 0,
          totalPagosVenta: 0,
          esHeader: false,
          ventaId: grupo.ventaId,
          consecutivo: pago.consecutivo,
        });
      }
    }

    return rows;
  }, [pagosAgrupados]);

  const columns = [
    {
      header: "Venta",
      accessor: (row: PaymentTableRow) =>
        row.esHeader ? (
          <span className="font-semibold">{row.venta}</span>
        ) : (
          <span className="text-text-secondary pl-4">↳</span>
        ),
      className: "font-medium",
    },
    {
      header: "Fecha",
      accessor: (row: PaymentTableRow) => row.fechaVenta,
      className: "text-text-secondary",
    },
    {
      header: "Cliente",
      accessor: (row: PaymentTableRow) => (row.esHeader ? row.cliente : ""),
      className: "text-text-secondary",
    },
    {
      header: "Método de Pago",
      accessor: (row: PaymentTableRow) => {
        if (row.esHeader) {
          return row.metodoPago;
        }
        return (
          <div className="flex items-center gap-2">
            {row.consecutivo && (
              <span className="text-xs font-medium text-text-secondary">
                #{row.consecutivo}
              </span>
            )}
            <span>{row.metodoPago}</span>
          </div>
        );
      },
    },
    {
      header: "Valor Venta",
      accessor: (row: PaymentTableRow) =>
        row.esHeader ? formatPrice(row.ventaTotal) : "",
      className: "text-right",
    },
    {
      header: "Valor Pago",
      accessor: (row: PaymentTableRow) => formatPrice(row.cantidad),
      className: "text-right font-semibold",
    },
    {
      header: "Total Pagos",
      accessor: (row: PaymentTableRow) =>
        row.esHeader ? formatPrice(row.totalPagosVenta) : "",
      className: "text-right font-bold",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Ventas */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Total Ventas</p>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-semibold">{formatPrice(totalVentas)}</p>
          </CardContent>
        </Card>

        {/* Total Pagos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Total Pagos</p>
              <div className="p-2 bg-success/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
            </div>
            <p className="text-3xl font-semibold">{formatPrice(totalPagos)}</p>
          </CardContent>
        </Card>

        {/* Diferencia */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Diferencia</p>
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
            </div>
            <p
              className={`text-3xl font-semibold ${
                diferencia >= 0 ? "text-success" : "text-error"
              }`}
            >
              {diferencia >= 0 ? "+" : ""}
              {formatPrice(diferencia)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Totales por método de pago */}
      {totalesPorMetodoPago.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Totales por Método de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {totalesPorMetodoPago.map((item) => (
                <div
                  key={item.metodoPago}
                  className="flex items-center justify-between p-3 bg-surface-2 rounded-lg border border-border"
                >
                  <span className="text-sm text-text-secondary">
                    {item.metodoPago}
                  </span>
                  <span className="text-sm font-semibold">
                    {formatPrice(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Historial Detallado de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pagos.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <p>
                No hay pagos registrados para el rango de fechas seleccionado
              </p>
            </div>
          ) : (
            <DataTable
              data={tableRows}
              columns={columns}
              keyExtractor={(row) => row.id}
              defaultItemsPerPage={10}
              itemsPerPageOptions={[10, 20, 50]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DollarSign, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type {
  PaymentHistoryItem,
  TotalPorMetodoPago,
} from "../actions/get-caja-data";

interface CajaAsesorViewProps {
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

export function CajaAsesorView({
  totalVentas,
  totalPagos,
  diferencia,
  pagos,
  totalesPorMetodoPago,
}: CajaAsesorViewProps) {
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

    // Ordenar por fecha de venta (más reciente primero)
    return Array.from(grouped.values()).sort(
      (a, b) => b.ventaCreatedAt.getTime() - a.ventaCreatedAt.getTime(),
    );
  }, [pagos]);
  return (
    <div className="space-y-4">
      {/* Resumen principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Resumen de Caja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Ventas */}
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Ventas</p>
                <p className="text-2xl font-semibold">
                  {formatPrice(totalVentas)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Pagos */}
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">
                  Total Pagos Recibidos
                </p>
                <p className="text-2xl font-semibold">
                  {formatPrice(totalPagos)}
                </p>
              </div>
            </div>
          </div>

          {/* Diferencia */}
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg border-2 border-dashed">
            <div>
              <p className="text-sm text-text-secondary">Diferencia</p>
              <p
                className={`text-xl font-semibold ${
                  diferencia >= 0 ? "text-success" : "text-error"
                }`}
              >
                {diferencia >= 0 ? "+" : ""}
                {formatPrice(diferencia)}
              </p>
            </div>
          </div>

          {/* Totales por método de pago */}
          {totalesPorMetodoPago.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium text-text-secondary mb-3">
                Totales por Método de Pago
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {totalesPorMetodoPago.map((item) => (
                  <div
                    key={item.metodoPago}
                    className="flex items-center justify-between p-2 bg-surface-1 rounded border border-border/50"
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Historial de Pagos
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
            <div className="space-y-4">
              {pagosAgrupados.map((grupo) => (
                <div
                  key={grupo.ventaId}
                  className="p-4 bg-surface-2 rounded-lg border border-border space-y-3"
                >
                  {/* Header de la venta */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">
                          Venta #{grupo.ventaConsecutivo}
                        </p>
                        {grupo.clienteNombre && (
                          <span className="text-xs text-text-secondary">
                            • {grupo.clienteNombre}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary">
                        {format(
                          grupo.ventaCreatedAt,
                          "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                          {
                            locale: es,
                          },
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-secondary">Total Venta</p>
                      <p className="font-semibold text-sm">
                        {formatPrice(grupo.ventaTotal)}
                      </p>
                    </div>
                  </div>

                  {/* Lista de pagos */}
                  <div className="space-y-2">
                    {grupo.pagos.map((pago) => (
                      <div
                        key={pago.id}
                        className="flex items-center justify-between p-2 bg-surface-1 rounded border border-border/50"
                      >
                        <div className="flex items-center gap-2">
                          {pago.consecutivo && (
                            <span className="text-xs font-medium text-text-secondary">
                              #{pago.consecutivo}
                            </span>
                          )}
                          <span className="text-xs font-medium text-text-secondary">
                            {pago.metodoPago}
                          </span>
                          <span className="text-xs text-text-secondary">
                            • {format(pago.createdAt, "HH:mm", { locale: es })}
                          </span>
                        </div>
                        <p className="font-semibold text-sm">
                          {formatPrice(pago.cantidad)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total de pagos de la venta */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-sm font-medium text-text-secondary">
                      Total Pagado
                    </p>
                    <p className="font-bold text-base">
                      {formatPrice(grupo.totalPagos)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import {
  useAdvisorDailyPerformance,
  useCostCenterDailyPerformance,
  useIncomeByCostCenterPaymentMethod,
  useRecentPurchases,
  useRecentSales,
  useStuckCellphones,
} from "./dashboard-screen.queries";

export function DashboardScreen() {
  const { data: advisorPerformance = [], isLoading: isLoadingAdvisor } =
    useAdvisorDailyPerformance();
  const { data: costCenterPerformance = [], isLoading: isLoadingCostCenter } =
    useCostCenterDailyPerformance();
  const { data: stuckCellphones = [], isLoading: isLoadingStuck } =
    useStuckCellphones();
  const { data: recentSales = [], isLoading: isLoadingSales } =
    useRecentSales();
  const { data: recentPurchases = [], isLoading: isLoadingPurchases } =
    useRecentPurchases();
  const { data: incomeByCostCenterPayment = [], isLoading: isLoadingIncome } =
    useIncomeByCostCenterPaymentMethod();

  // Formatear valores para las estadísticas
  const formatCurrency = (value: number) => {
    return formatPrice(value, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const incomeGrouped = incomeByCostCenterPayment.reduce(
    (acc, row) => {
      const costCenter = row.costCenterName ?? "Sin centro de costo";
      const existing = acc.get(costCenter) ?? {
        costCenter,
        total: 0,
        methods: [] as Array<{ name: string; amount: number }>,
      };

      existing.methods.push({
        name: row.paymentMethodName,
        amount: row.amount,
      });
      existing.total += row.amount;
      acc.set(costCenter, existing);
      return acc;
    },
    new Map<
      string,
      {
        costCenter: string;
        total: number;
        methods: Array<{ name: string; amount: number }>;
      }
    >(),
  );

  const incomeList = Array.from(incomeGrouped.values()).sort(
    (a, b) => b.total - a.total,
  );

  const formatDateTime = (date: string) =>
    new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));

  const formatRelative = (date: string) =>
    formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1>Panel Principal</h1>
        <p className="text-text-secondary mt-1">
          ¡Bienvenido! Aquí está lo que está sucediendo con tu inventario.
        </p>
      </div>

      {/* Productividad (listas) */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asesores - utilidad de hoy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingAdvisor ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : advisorPerformance.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Aún no hay ventas registradas hoy.
              </p>
            ) : (
              advisorPerformance.map((item) => {
                const target = item.target;
                const targetLabel = target
                  ? formatCurrency(target)
                  : "Sin meta";

                return (
                  <div
                    key={item.sellerId ?? item.sellerName}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.sellerName}</p>
                      <p className="text-xs text-text-secondary">
                        Ventas: {item.salesCount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.profit)}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Meta: {targetLabel}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Centros de costo - utilidad de hoy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingCostCenter ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : costCenterPerformance.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Aún no hay ventas registradas hoy.
              </p>
            ) : (
              costCenterPerformance.map((item) => {
                const target = item.target;
                const targetLabel = target
                  ? formatCurrency(target)
                  : "Sin meta";

                return (
                  <div
                    key={item.costCenterId ?? item.costCenterName}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.costCenterName}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Ventas: {item.salesCount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.profit)}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Meta: {targetLabel}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ingresos por centro de costo / productos estancados */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Ingresos por medio de pago</CardTitle>
            <p className="text-xs text-text-secondary">
              Filtrado según permisos (tu centro de costo si no eres admin).
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingIncome ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : incomeList.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Aún no hay pagos registrados para tu centro de costo.
              </p>
            ) : (
              incomeList.map((entry) => (
                <div
                  key={entry.costCenter}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{entry.costCenter}</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(entry.total)}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    {entry.methods.map((method) => (
                      <div
                        key={`${entry.costCenter}-${method.name}`}
                        className="flex items-center justify-between text-xs text-text-secondary"
                      >
                        <span>{method.name}</span>
                        <span className="font-medium text-text">
                          {formatCurrency(method.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Celulares estancados (top 5)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingStuck ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : stuckCellphones.length > 0 ? (
              stuckCellphones.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-text-secondary">
                        {[item.brand, item.model].filter(Boolean).join(" · ") ||
                          "-"}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        En bodega {formatRelative(item.firstEntryDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{item.stock} uds</p>
                      <p className="text-xs text-text-tertiary">
                        {item.ageDays} días en inventario
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-secondary">
                No hay celulares estancados en inventario.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ventas y compras recientes */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingSales ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-surface-2 p-2">
                        <ShoppingBag className="h-4 w-4 text-text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Venta #{sale.consecutivo}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatDateTime(sale.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(sale.total)}
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Vendedor: {sale.seller}
                    {sale.client ? ` · Cliente: ${sale.client}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-secondary">
                No hay ventas recientes.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compras recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingPurchases ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : recentPurchases.length > 0 ? (
              recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-surface-2 p-2">
                        <ShoppingCart className="h-4 w-4 text-text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {purchase.movementType}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatDateTime(purchase.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(purchase.totalCost)}
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Proveedor: {purchase.supplier ?? "-"}
                    {purchase.createdBy
                      ? ` · Usuario: ${purchase.createdBy}`
                      : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-secondary">
                No hay compras recientes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Product, ProductCard, StatCard } from "@/features/inventory";
import {
  type LowStockProductDTO,
  type RecentActivityDTO,
  useDashboardMetrics,
  useLowStockProducts,
  useRecentActivity,
} from "./dashboard-screen.queries";

// Datos mock temporales para gráficos (hasta implementar queries de revenue y categorías)
const mockRevenueData = [
  { month: "Ene", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Abr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
];

const mockCategoryData = [
  { category: "Teléfonos", count: 245 },
  { category: "Fundas", count: 432 },
  { category: "Cargadores", count: 178 },
  { category: "Auriculares", count: 156 },
  { category: "Cables", count: 289 },
];

// Función helper para transformar LowStockProduct a Product
function transformLowStockProduct(product: LowStockProductDTO): Product {
  const stock = product.quantity;
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category ?? "Sin categoría",
    price: product.price,
    stock,
    stockStatus: stock <= 10 ? "low-stock" : "in-stock",
    image: product.imageUrl ?? undefined,
  };
}

// Función helper para formatear actividad reciente
function formatActivity(activity: RecentActivityDTO) {
  const updatedAt = new Date(activity.updatedAt);
  const timeAgo = formatDistanceToNow(updatedAt, {
    addSuffix: true,
    locale: es,
  });

  return {
    id: activity.id,
    action: "Producto actualizado",
    item: activity.name,
    time: timeAgo,
  };
}

export function DashboardScreen() {
  const { data: metrics, isLoading: isLoadingMetrics } = useDashboardMetrics();
  const { data: lowStockProducts = [], isLoading: isLoadingLowStock } =
    useLowStockProducts(10);
  const { data: recentActivity = [], isLoading: isLoadingActivity } =
    useRecentActivity();

  // Transformar productos con stock bajo al formato esperado
  const transformedLowStockProducts = lowStockProducts.map(
    transformLowStockProduct,
  );

  // Transformar actividad reciente
  const formattedActivity = recentActivity.slice(0, 4).map(formatActivity);

  // Formatear valores para las estadísticas
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-CO").format(value);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1>Panel Principal</h1>
        <p className="text-text-secondary mt-1">
          ¡Bienvenido! Aquí está lo que está sucediendo con tu inventario.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingMetrics ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Productos"
              value={formatNumber(metrics?.totalProducts ?? 0)}
              icon={Package}
            />
            <StatCard
              title="Valor Inventario"
              value={formatCurrency(metrics?.inventoryValue ?? 0)}
              icon={DollarSign}
            />
            <StatCard
              title="Stock Bajo"
              value={formatNumber(metrics?.lowStockCount ?? 0)}
              icon={AlertCircle}
            />
            <StatCard
              title="Total Stock"
              value={formatNumber(metrics?.totalStock ?? 0)}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  stroke="var(--text-secondary)"
                  fontSize={12}
                />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-1)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="category"
                  stroke="var(--text-secondary)"
                  fontSize={12}
                />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Low Stock Alert */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Alerta de Stock Bajo</CardTitle>
              <Button variant="ghost" size="sm">
                Ver Todo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingLowStock ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : transformedLowStockProducts.length > 0 ? (
                transformedLowStockProducts
                  .slice(0, 3)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant="list"
                    />
                  ))
              ) : (
                <p className="text-sm text-text-secondary text-center py-4">
                  No hay productos con stock bajo
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : formattedActivity.length > 0 ? (
              <div className="space-y-4">
                {formattedActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-1">
                      <div className="p-2 rounded-lg bg-surface-2">
                        <Activity className="h-4 w-4 text-text-secondary" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-sm text-text-secondary">
                        {activity.item}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">
                No hay actividad reciente
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

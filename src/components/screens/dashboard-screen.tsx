"use client";

import { StatCard } from "../inventory/stat-card";
import { ProductCard, Product } from "../inventory/product-card";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Package,
  TrendingUp,
  AlertCircle,
  DollarSign,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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

const mockLowStockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    sku: "IPH-15PM-256-BLK",
    category: "Smartphones",
    price: 1199,
    stock: 3,
    stockStatus: "low-stock",
    image: "https://images.unsplash.com/photo-1592286927505-b0c8e0d16f3f?w=400",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    sku: "SAM-S24U-512-GRY",
    category: "Smartphones",
    price: 1299,
    stock: 2,
    stockStatus: "low-stock",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
  },
  {
    id: "3",
    name: "USB-C Fast Charger",
    sku: "CHR-USBC-65W",
    category: "Accessories",
    price: 29,
    stock: 5,
    stockStatus: "low-stock",
  },
];

const recentActivity = [
  {
    id: "1",
    action: "Nuevo pedido recibido",
    item: "iPhone 15 Pro",
    time: "Hace 2 min",
    type: "order",
  },
  {
    id: "2",
    action: "Stock actualizado",
    item: "Galaxy S24 Ultra",
    time: "Hace 15 min",
    type: "stock",
  },
  {
    id: "3",
    action: "Alerta de stock bajo",
    item: "Cargador USB-C",
    time: "Hace 1 hora",
    type: "alert",
  },
  {
    id: "4",
    action: "Nuevo producto agregado",
    item: "AirPods Pro 2",
    time: "Hace 3 horas",
    type: "product",
  },
];

export function DashboardScreen() {
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
        <StatCard
          title="Total Productos"
          value="1,284"
          change={{ value: 12.5, label: "desde el mes pasado" }}
          icon={Package}
        />
        <StatCard
          title="Ingresos Totales"
          value="$67,890"
          change={{ value: 8.2, label: "desde el mes pasado" }}
          icon={DollarSign}
        />
        <StatCard
          title="Stock Bajo"
          value="23"
          change={{ value: -15.3, label: "desde la semana pasada" }}
          icon={AlertCircle}
        />
        <StatCard
          title="Pedidos Hoy"
          value="47"
          change={{ value: 23.1, label: "desde ayer" }}
          icon={TrendingUp}
        />
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
                <Bar dataKey="count" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
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
              {mockLowStockProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="list"
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
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
                    <p className="text-xs text-text-tertiary">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

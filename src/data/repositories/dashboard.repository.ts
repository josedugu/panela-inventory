import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export interface DashboardMetrics {
  totalProducts: number;
  inventoryValue: number;
  lowStockCount: number;
  totalStock: number;
}

export interface AdvisorProfitRankingItem {
  sellerId: string | null;
  sellerName: string;
  salesCount: number;
  revenue: number;
  profit: number;
}

export interface CostCenterProfitRankingItem {
  costCenterId: string | null;
  costCenterName: string;
  revenue: number;
  profit: number;
}

export interface AdvisorDailyPerformanceItem {
  sellerId: string | null;
  sellerName: string;
  salesCount: number;
  profit: number;
  target: number | null;
}

export interface CostCenterDailyPerformanceItem {
  costCenterId: string | null;
  costCenterName: string;
  profit: number;
  salesCount: number;
  target: number | null;
}

export interface StuckProductItem {
  productId: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  firstEntryDate: string;
  ageDays: number;
  stock: number;
}

export interface RecentSaleItem {
  id: string;
  consecutivo: number;
  total: number;
  seller: string;
  client: string | null;
  createdAt: string;
}

export interface RecentPurchaseItem {
  id: string;
  movementType: string;
  totalCost: number;
  supplier: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface IncomeByCostCenterPaymentMethodRow {
  costCenterId: string | null;
  costCenterName: string;
  paymentMethodId: string;
  paymentMethodName: string;
  amount: number;
}

export interface RecentActivityItem {
  id: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [totalProducts, lowStockCount, products] = await Promise.all([
    prisma.producto.count(),
    prisma.producto.count({
      where: {
        cantidad: {
          lte: 10,
        },
        estado: true,
      },
    }),
    prisma.producto.findMany({
      select: {
        cantidad: true,
        costo: true,
      },
    }),
  ]);

  const { totalStock, inventoryValue } = products.reduce(
    (acc, product) => {
      const cost = product.costo ? Number(product.costo) : 0;
      return {
        totalStock: acc.totalStock + product.cantidad,
        inventoryValue: acc.inventoryValue + cost * product.cantidad,
      };
    },
    { totalStock: 0, inventoryValue: 0 },
  );

  return {
    totalProducts,
    lowStockCount,
    totalStock,
    inventoryValue,
  };
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const products = await prisma.producto.findMany({
    select: {
      id: true,
      descripcion: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return products.map((product) => ({
    id: product.id,
    name: product.descripcion ?? "Sin descripción",
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));
}

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value);
}

export async function getAdvisorProfitRanking(): Promise<
  AdvisorProfitRankingItem[]
> {
  const rows = await prisma.$queryRaw<
    Array<{
      seller_id: string | null;
      seller_name: string | null;
      sales_count: number | bigint;
      revenue: Prisma.Decimal;
      profit: Prisma.Decimal;
    }>
  >`
    SELECT
      v.vendido_por_id AS seller_id,
      COALESCE(u.nombre, u.email, 'Sin asesor') AS seller_name,
      COUNT(DISTINCT v.id) AS sales_count,
      SUM(COALESCE(vp.total, 0)) AS revenue,
      SUM(COALESCE(vp.total, 0) - COALESCE(vp.costo_total, 0)) AS profit
    FROM "dev"."venta" v
    JOIN "dev"."venta_producto" vp ON vp.venta_id = v.id
    LEFT JOIN "dev"."usuario" u ON u.id = v.vendido_por_id
    WHERE v.estado = TRUE
    GROUP BY seller_id, seller_name
    ORDER BY profit DESC NULLS LAST
    LIMIT 10
  `;

  return rows.map((row) => ({
    sellerId: row.seller_id,
    sellerName: row.seller_name ?? "Sin asesor",
    salesCount: Number(row.sales_count ?? 0),
    revenue: decimalToNumber(row.revenue),
    profit: decimalToNumber(row.profit),
  }));
}

export async function getCostCenterProfitRanking(): Promise<
  CostCenterProfitRankingItem[]
> {
  const rows = await prisma.$queryRaw<
    Array<{
      cost_center_id: string | null;
      cost_center_name: string | null;
      revenue: Prisma.Decimal;
      profit: Prisma.Decimal;
    }>
  >`
    SELECT
      v.centro_costo_id AS cost_center_id,
      COALESCE(cc.nombre, 'Sin centro de costo') AS cost_center_name,
      SUM(COALESCE(vp.total, 0)) AS revenue,
      SUM(COALESCE(vp.total, 0) - COALESCE(vp.costo_total, 0)) AS profit
    FROM "dev"."venta" v
    JOIN "dev"."venta_producto" vp ON vp.venta_id = v.id
    LEFT JOIN "dev"."centro_costo" cc ON cc.id = v.centro_costo_id
    WHERE v.estado = TRUE
    GROUP BY cost_center_id, cost_center_name
    ORDER BY profit DESC NULLS LAST
    LIMIT 10
  `;

  return rows.map((row) => ({
    costCenterId: row.cost_center_id,
    costCenterName: row.cost_center_name ?? "Sin centro de costo",
    revenue: decimalToNumber(row.revenue),
    profit: decimalToNumber(row.profit),
  }));
}

export async function getAdvisorProfitToday(): Promise<
  AdvisorDailyPerformanceItem[]
> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const rows = await prisma.$queryRaw<
    Array<{
      seller_id: string | null;
      seller_name: string | null;
      sales_count: number | bigint;
      profit: Prisma.Decimal;
    }>
  >`
    SELECT
      v.vendido_por_id AS seller_id,
      COALESCE(u.nombre, u.email, 'Sin asesor') AS seller_name,
      COUNT(DISTINCT v.id) AS sales_count,
      SUM(COALESCE(vp.total, 0) - COALESCE(vp.costo_total, 0)) AS profit
    FROM "dev"."venta" v
    JOIN "dev"."venta_producto" vp ON vp.venta_id = v.id
    LEFT JOIN "dev"."usuario" u ON u.id = v.vendido_por_id
    WHERE v.estado = TRUE
      AND v.created_at >= ${startOfDay}
      AND v.created_at < ${endOfDay}
    GROUP BY seller_id, seller_name
    ORDER BY profit DESC NULLS LAST
  `;

  return rows.map((row) => ({
    sellerId: row.seller_id,
    sellerName: row.seller_name ?? "Sin asesor",
    salesCount: Number(row.sales_count ?? 0),
    profit: decimalToNumber(row.profit),
    target: null,
  }));
}

export async function getCostCenterProfitToday(): Promise<
  CostCenterDailyPerformanceItem[]
> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const rows = await prisma.$queryRaw<
    Array<{
      cost_center_id: string | null;
      cost_center_name: string | null;
      sales_count: number | bigint;
      profit: Prisma.Decimal;
    }>
  >`
    SELECT
      v.centro_costo_id AS cost_center_id,
      COALESCE(cc.nombre, 'Sin centro de costo') AS cost_center_name,
      COUNT(DISTINCT v.id) AS sales_count,
      SUM(COALESCE(vp.total, 0) - COALESCE(vp.costo_total, 0)) AS profit
    FROM "dev"."venta" v
    JOIN "dev"."venta_producto" vp ON vp.venta_id = v.id
    LEFT JOIN "dev"."centro_costo" cc ON cc.id = v.centro_costo_id
    WHERE v.estado = TRUE
      AND v.created_at >= ${startOfDay}
      AND v.created_at < ${endOfDay}
    GROUP BY cost_center_id, cost_center_name
    ORDER BY profit DESC NULLS LAST
  `;

  return rows.map((row) => ({
    costCenterId: row.cost_center_id,
    costCenterName: row.cost_center_name ?? "Sin centro de costo",
    salesCount: Number(row.sales_count ?? 0),
    profit: decimalToNumber(row.profit),
    target: null,
  }));
}

export async function getStuckCellphones(): Promise<StuckProductItem[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      product_id: string;
      descripcion: string | null;
      modelo_nombre: string | null;
      marca_nombre: string | null;
      categoria: string | null;
      first_entry: Date;
      stock: bigint;
    }>
  >`
    SELECT
      p.id AS product_id,
      p.descripcion,
      m.nombre AS modelo_nombre,
      ma.nombre AS marca_nombre,
      tp.nombre AS categoria,
      MIN(pd.created_at) AS first_entry,
      COUNT(pd.id) AS stock
    FROM "dev"."producto" p
    JOIN "dev"."tipo_producto" tp ON tp.id = p.tipo_producto_id
    JOIN "dev"."producto_detalle" pd ON pd.producto_id = p.id AND pd.estado = TRUE
    LEFT JOIN "dev"."modelo" m ON m.id = p.modelo_id
    LEFT JOIN "dev"."marca" ma ON ma.id = p.marca_id
    WHERE p.estado = TRUE AND tp.nombre ILIKE '%celular%'
    GROUP BY p.id, p.descripcion, m.nombre, ma.nombre, tp.nombre
    ORDER BY first_entry ASC NULLS LAST
    LIMIT 5
  `;

  const now = Date.now();

  return rows.map((row) => {
    const firstEntryDate = row.first_entry;
    const ageDays = Math.floor((now - firstEntryDate.getTime()) / 86_400_000);

    return {
      productId: row.product_id,
      name:
        row.descripcion || row.modelo_nombre || row.marca_nombre || "Producto",
      brand: row.marca_nombre,
      model: row.modelo_nombre,
      category: row.categoria,
      firstEntryDate: firstEntryDate.toISOString(),
      ageDays,
      stock: Number(row.stock ?? 0),
    };
  });
}

export async function getRecentSales(): Promise<RecentSaleItem[]> {
  const sales = await prisma.venta.findMany({
    where: { estado: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      cliente: {
        select: { nombre: true },
      },
      vendidoPor: {
        select: { nombre: true, email: true },
      },
    },
  });

  return sales.map((sale) => ({
    id: sale.id,
    consecutivo: sale.consecutivo,
    total: decimalToNumber(sale.total),
    seller: sale.vendidoPor?.nombre ?? sale.vendidoPor?.email ?? "-",
    client: sale.cliente?.nombre ?? null,
    createdAt: sale.createdAt.toISOString(),
  }));
}

export async function getRecentPurchases(): Promise<RecentPurchaseItem[]> {
  const purchases = await prisma.movimientoInventario.findMany({
    where: {
      estado: true,
      tipoMovimiento: {
        ingreso: true,
        nombre: {
          contains: "compra",
          mode: "insensitive",
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      tipoMovimiento: true,
      proveedor: {
        select: { nombre: true },
      },
      creadoPor: {
        select: { nombre: true, email: true },
      },
    },
  });

  return purchases.map((purchase) => ({
    id: purchase.id,
    movementType: purchase.tipoMovimiento?.nombre ?? "Compra",
    totalCost: decimalToNumber(purchase.costoUnitario) * purchase.cantidad,
    supplier: purchase.proveedor?.nombre ?? null,
    createdBy: purchase.creadoPor?.nombre ?? purchase.creadoPor?.email ?? null,
    createdAt: purchase.createdAt.toISOString(),
  }));
}

export async function getIncomeByCostCenterPaymentMethod(
  allowedCostCenterIds?: string[] | null,
): Promise<IncomeByCostCenterPaymentMethodRow[]> {
  if (allowedCostCenterIds && allowedCostCenterIds.length === 0) {
    return [];
  }

  const costCenterFilter =
    allowedCostCenterIds && allowedCostCenterIds.length > 0
      ? Prisma.sql`AND v.centro_costo_id IN (${Prisma.join(allowedCostCenterIds)})`
      : Prisma.empty;

  const rows = await prisma.$queryRaw<
    Array<{
      cost_center_id: string | null;
      cost_center_name: string | null;
      payment_method_id: string;
      payment_method_name: string;
      amount: Prisma.Decimal;
    }>
  >(Prisma.sql`
    SELECT
      v.centro_costo_id AS cost_center_id,
      COALESCE(cc.nombre, 'Sin centro de costo') AS cost_center_name,
      mp.id AS payment_method_id,
      mp.nombre AS payment_method_name,
      SUM(p.cantidad) AS amount
    FROM "dev"."pago" p
    JOIN "dev"."venta" v ON v.id = p.venta_id
    JOIN "dev"."metodo_pago" mp ON mp.id = p.metodo_pago_id
    LEFT JOIN "dev"."centro_costo" cc ON cc.id = v.centro_costo_id
    WHERE v.estado = TRUE
      ${costCenterFilter}
    GROUP BY cost_center_id, cost_center_name, payment_method_id, payment_method_name
    ORDER BY cost_center_name, payment_method_name
  `);

  return rows.map((row) => ({
    costCenterId: row.cost_center_id,
    costCenterName: row.cost_center_name ?? "Sin centro de costo",
    paymentMethodId: row.payment_method_id,
    paymentMethodName: row.payment_method_name,
    amount: decimalToNumber(row.amount),
  }));
}

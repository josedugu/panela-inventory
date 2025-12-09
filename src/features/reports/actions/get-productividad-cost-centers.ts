"use server";

import { Prisma } from "@prisma/client";
import {
  addDays,
  addWeeks,
  endOfMonth,
  endOfYear,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/prisma/client";
import { getAccessibleCostCentersAction } from "./get-accessible-cost-centers";
import type {
  ProductivityColumn,
  ProductivityMode,
} from "./get-productividad-data";

export interface CostCenterProductivityRow {
  centroCostoId: string;
  centroCostoNombre: string;
  descripcion?: string | null;
  valores: Record<string, number>;
  total: number;
  promedio: number;
}

export interface CostCenterProductivityResponse {
  mode: ProductivityMode;
  columns: ProductivityColumn[];
  rows: CostCenterProductivityRow[];
  rangeLabel: string;
  totalGeneral: number;
  promedioGeneral: number;
  centrosDisponibles: {
    id: string;
    nombre: string;
    descripcion?: string | null;
  }[];
}

interface CostCenterProductivityParams {
  mode: ProductivityMode;
  startDate?: string;
  year?: number;
  centroCostoIds?: string[];
}

interface DbCostCenterRow {
  centro_costo_id: string | null;
  centro_costo_nombre: string | null;
  periodo_date: Date;
  periodo_label: string | null;
  utilidad: Prisma.Decimal;
  total_bruto: Prisma.Decimal;
  costo_total: Prisma.Decimal;
  comision_plataforma: Prisma.Decimal;
  comision_asesor: Prisma.Decimal;
}

function normalizeDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? parsed : new Date();
}

function buildWeeklyColumns(startDate: Date): ProductivityColumn[] {
  return Array.from({ length: 7 }).map((_, idx) => {
    const date = addDays(startDate, idx);
    return {
      id: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE dd/MM", { locale: es }),
    };
  });
}

function buildMonthlyColumns(monthDate: Date): ProductivityColumn[] {
  const startMonth = startOfMonth(monthDate);
  const endMonth = endOfMonth(monthDate);
  const firstWeekStart = startOfWeek(startMonth, { weekStartsOn: 1 });

  const columns: ProductivityColumn[] = [];
  let currentWeekStart = firstWeekStart;
  let index = 1;

  while (currentWeekStart <= endMonth) {
    const visibleStart =
      currentWeekStart < startMonth ? startMonth : currentWeekStart;
    const visibleEnd = addDays(visibleStart, 6);
    columns.push({
      id: format(currentWeekStart, "yyyy-MM-dd"),
      label: `Semana ${index} (${format(visibleStart, "dd MMM", { locale: es })} - ${format(visibleEnd > endMonth ? endMonth : visibleEnd, "dd MMM", { locale: es })})`,
    });
    currentWeekStart = addWeeks(currentWeekStart, 1);
    index += 1;
  }

  return columns;
}

function buildYearlyColumns(_year: number): ProductivityColumn[] {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  return months.map((label, idx) => ({
    id: `month-${idx + 1}`,
    label,
  }));
}

function getRange(params: CostCenterProductivityParams) {
  if (params.mode === "weekly") {
    const start = startOfWeek(normalizeDate(params.startDate), {
      weekStartsOn: 1,
    });
    const end = addDays(start, 6);
    return { start, end };
  }

  if (params.mode === "monthly") {
    const start = startOfMonth(normalizeDate(params.startDate));
    return { start, end: endOfMonth(start) };
  }

  const year =
    typeof params.year === "number" && Number.isFinite(params.year)
      ? params.year
      : new Date().getFullYear();

  return {
    start: startOfYear(new Date(year, 0, 1)),
    end: endOfYear(new Date(year, 0, 1)),
  };
}

export async function getProductividadCostCentersAction(
  params: CostCenterProductivityParams,
): Promise<{ success: true; data: CostCenterProductivityResponse }> {
  const { start, end } = getRange(params);
  const mode = params.mode;
  const centroCostoIds = params.centroCostoIds?.filter(Boolean) ?? null;
  const dbMode: "weekly" | "monthly" = mode === "yearly" ? "monthly" : "weekly";

  const columns =
    mode === "weekly"
      ? buildWeeklyColumns(start)
      : mode === "monthly"
        ? buildMonthlyColumns(start)
        : buildYearlyColumns(start.getFullYear());

  const rangeLabel =
    mode === "weekly"
      ? `Semana del ${format(start, "dd MMM yyyy", { locale: es })} al ${format(end, "dd MMM yyyy", { locale: es })}`
      : mode === "monthly"
        ? format(start, "LLLL yyyy", { locale: es })
        : `Año ${start.getFullYear()}`;

  const centrosDisponiblesResult = await getAccessibleCostCentersAction();
  const centrosDisponibles =
    centrosDisponiblesResult.success === true
      ? centrosDisponiblesResult.data
      : [];

  const columnIds = new Set(columns.map((column) => column.id));

  const dbRows = await prisma.$queryRaw<DbCostCenterRow[]>(Prisma.sql`
    select *
    from dev.f_productividad_centro_costo(
      ${start.toISOString()}::date,
      ${end.toISOString()}::date,
      ${dbMode},
      ${centroCostoIds}::uuid[]
    )
  `);

  const costCenterMap = new Map<string, CostCenterProductivityRow>();

  for (const row of dbRows) {
    const columnId =
      mode === "weekly"
        ? format(row.periodo_date, "yyyy-MM-dd")
        : mode === "monthly"
          ? format(
              startOfWeek(row.periodo_date, { weekStartsOn: 1 }),
              "yyyy-MM-dd",
            )
          : `month-${row.periodo_date.getMonth() + 1}`;

    if (!columnIds.has(columnId)) continue;

    const currentId = row.centro_costo_id ?? "sin-centro";

    const current = costCenterMap.get(currentId) ?? {
      centroCostoId: currentId,
      centroCostoNombre: row.centro_costo_nombre ?? "Sin centro",
      descripcion: null,
      valores: {},
      total: 0,
      promedio: 0,
    };

    const utilidadNumber = Number(row.utilidad ?? 0);
    current.valores[columnId] =
      (current.valores[columnId] ?? 0) + utilidadNumber;
    current.total += utilidadNumber;

    costCenterMap.set(currentId, current);
  }

  const rows = Array.from(costCenterMap.values()).map((item) => ({
    ...item,
    promedio: columns.length > 0 ? item.total / columns.length : item.total,
  }));

  const totalGeneral = rows.reduce((sum, row) => sum + row.total, 0);
  const promedioGeneral =
    rows.length > 0 ? totalGeneral / rows.length : totalGeneral;

  return {
    success: true,
    data: {
      mode,
      columns,
      rows,
      rangeLabel,
      totalGeneral,
      promedioGeneral,
      centrosDisponibles,
    },
  };
}

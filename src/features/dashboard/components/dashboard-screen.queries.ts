"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics } from "@/data/queries/dashboard.queries";
import { getDashboardMetricsAction } from "@/features/dashboard/actions/get-dashboard-metrics";
import {
  getLowStockProductsAction,
  type LowStockProductDTO,
} from "@/features/dashboard/actions/get-low-stock-products";
import {
  getRecentActivityAction,
  type RecentActivityDTO,
} from "@/features/dashboard/actions/get-recent-activity";

// Hook para obtener métricas del dashboard
export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ["dashboard", "metrics"],
    queryFn: async () => {
      return await getDashboardMetricsAction();
    },
    staleTime: 1000 * 60 * 2, // 2 minutos (Panel Principal se mantiene actualizado)
    refetchOnWindowFocus: true, // Mantener actualizado al volver a la ventana
  });
}

// Hook para obtener actividad reciente
export function useRecentActivity() {
  return useQuery<RecentActivityDTO[]>({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: async () => {
      return await getRecentActivityAction();
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
  });
}

// Hook para obtener productos con stock bajo
export function useLowStockProducts(threshold = 10) {
  return useQuery<LowStockProductDTO[]>({
    queryKey: ["dashboard", "low-stock-products", threshold],
    queryFn: async () => {
      return await getLowStockProductsAction(threshold);
    },
    staleTime: 1000 * 60 * 2, // 2 minutos (Panel Principal se mantiene actualizado)
    refetchOnWindowFocus: true, // Mantener actualizado al volver a la ventana
  });
}

export type { LowStockProductDTO, RecentActivityDTO };

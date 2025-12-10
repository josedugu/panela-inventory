"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics } from "@/data/repositories/dashboard.repository";
import { getAdvisorDailyPerformanceAction } from "@/features/dashboard/actions/get-advisor-daily-performance";
import { getCostCenterDailyPerformanceAction } from "@/features/dashboard/actions/get-cost-center-daily-performance";
import { getDashboardMetricsAction } from "@/features/dashboard/actions/get-dashboard-metrics";
import { getIncomeByCostCenterPaymentMethodAction } from "@/features/dashboard/actions/get-income-by-cost-center-payment-method";
import {
  getLowStockProductsAction,
  type LowStockProductDTO,
} from "@/features/dashboard/actions/get-low-stock-products";
import {
  getRecentActivityAction,
  type RecentActivityDTO,
} from "@/features/dashboard/actions/get-recent-activity";
import { getRecentPurchasesAction } from "@/features/dashboard/actions/get-recent-purchases";
import { getRecentSalesAction } from "@/features/dashboard/actions/get-recent-sales";
import { getStuckCellphonesAction } from "@/features/dashboard/actions/get-stuck-cellphones";
import type {
  AdvisorDailyPerformanceDTO,
  CostCenterDailyPerformanceDTO,
  IncomeByCostCenterPaymentMethodDTO,
  RecentPurchaseDTO,
  RecentSaleDTO,
  StuckCellphoneDTO,
} from "../actions";

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

export function useAdvisorDailyPerformance() {
  return useQuery<AdvisorDailyPerformanceDTO[]>({
    queryKey: ["dashboard", "advisor-daily-performance"],
    queryFn: async () => {
      return await getAdvisorDailyPerformanceAction();
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

export function useCostCenterDailyPerformance() {
  return useQuery<CostCenterDailyPerformanceDTO[]>({
    queryKey: ["dashboard", "cost-center-daily-performance"],
    queryFn: async () => {
      return await getCostCenterDailyPerformanceAction();
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

export function useStuckCellphones() {
  return useQuery<StuckCellphoneDTO[]>({
    queryKey: ["dashboard", "stuck-cellphones"],
    queryFn: async () => {
      return await getStuckCellphonesAction();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}

export function useRecentSales() {
  return useQuery<RecentSaleDTO[]>({
    queryKey: ["dashboard", "recent-sales"],
    queryFn: async () => {
      return await getRecentSalesAction();
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

export function useRecentPurchases() {
  return useQuery<RecentPurchaseDTO[]>({
    queryKey: ["dashboard", "recent-purchases"],
    queryFn: async () => {
      return await getRecentPurchasesAction();
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

export function useIncomeByCostCenterPaymentMethod() {
  return useQuery<IncomeByCostCenterPaymentMethodDTO[]>({
    queryKey: ["dashboard", "income-cost-center-payment"],
    queryFn: async () => {
      return await getIncomeByCostCenterPaymentMethodAction();
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

export type { LowStockProductDTO, RecentActivityDTO };

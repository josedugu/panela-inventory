"use server";

import {
  type CostCenterDailyPerformanceItem,
  getCostCenterProfitToday,
} from "@/data/repositories/dashboard.repository";

export type CostCenterDailyPerformanceDTO = CostCenterDailyPerformanceItem;

export async function getCostCenterDailyPerformanceAction(): Promise<
  CostCenterDailyPerformanceDTO[]
> {
  return getCostCenterProfitToday();
}

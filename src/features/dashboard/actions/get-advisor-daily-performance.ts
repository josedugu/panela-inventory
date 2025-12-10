"use server";

import {
  type AdvisorDailyPerformanceItem,
  getAdvisorProfitToday,
} from "@/data/repositories/dashboard.repository";

export type AdvisorDailyPerformanceDTO = AdvisorDailyPerformanceItem;

export async function getAdvisorDailyPerformanceAction(): Promise<
  AdvisorDailyPerformanceDTO[]
> {
  return getAdvisorProfitToday();
}

"use server";

import {
  type DashboardMetrics,
  getDashboardMetrics as getMetrics,
} from "@/data/repositories/dashboard.repository";

export async function getDashboardMetricsAction(): Promise<DashboardMetrics> {
  const metrics = await getMetrics();
  return metrics;
}

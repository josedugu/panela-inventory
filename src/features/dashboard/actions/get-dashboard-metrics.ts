"use server";

import {
  type DashboardMetrics,
  getDashboardMetrics as getMetrics,
} from "@/data/queries/dashboard.queries";

export async function getDashboardMetricsAction(): Promise<DashboardMetrics> {
  const metrics = await getMetrics();
  return metrics;
}

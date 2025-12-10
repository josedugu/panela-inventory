"use server";

import {
  getRecentSales,
  type RecentSaleItem,
} from "@/data/repositories/dashboard.repository";

export type RecentSaleDTO = RecentSaleItem;

export async function getRecentSalesAction(): Promise<RecentSaleDTO[]> {
  return getRecentSales();
}

"use server";

import {
  getRecentPurchases,
  type RecentPurchaseItem,
} from "@/data/repositories/dashboard.repository";

export type RecentPurchaseDTO = RecentPurchaseItem;

export async function getRecentPurchasesAction(): Promise<RecentPurchaseDTO[]> {
  return getRecentPurchases();
}

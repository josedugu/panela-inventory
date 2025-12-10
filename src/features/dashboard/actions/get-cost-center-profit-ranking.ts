"use server";

import {
  type CostCenterProfitRankingItem,
  getCostCenterProfitRanking,
} from "@/data/repositories/dashboard.repository";

export type CostCenterProfitRankingDTO = CostCenterProfitRankingItem;

export async function getCostCenterProfitRankingAction(): Promise<
  CostCenterProfitRankingDTO[]
> {
  return getCostCenterProfitRanking();
}

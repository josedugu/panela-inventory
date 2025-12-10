"use server";

import {
  type AdvisorProfitRankingItem,
  getAdvisorProfitRanking,
} from "@/data/repositories/dashboard.repository";

export type AdvisorProfitRankingDTO = AdvisorProfitRankingItem;

export async function getAdvisorProfitRankingAction(): Promise<
  AdvisorProfitRankingDTO[]
> {
  return getAdvisorProfitRanking();
}

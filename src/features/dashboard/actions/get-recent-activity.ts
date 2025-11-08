"use server";

import {
  getRecentActivity as getActivity,
  type RecentActivityItem,
} from "@/data/repositories/dashboard.repository";

export type RecentActivityDTO = RecentActivityItem;

export async function getRecentActivityAction(): Promise<RecentActivityDTO[]> {
  const activity = await getActivity();
  return activity;
}

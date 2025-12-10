"use server";

import {
  getStuckCellphones,
  type StuckProductItem,
} from "@/data/repositories/dashboard.repository";

export type StuckCellphoneDTO = StuckProductItem;

export async function getStuckCellphonesAction(): Promise<StuckCellphoneDTO[]> {
  return getStuckCellphones();
}

"use server";

import {
  getIncomeByCostCenterPaymentMethod,
  type IncomeByCostCenterPaymentMethodRow,
} from "@/data/repositories/dashboard.repository";
import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";

export type IncomeByCostCenterPaymentMethodDTO =
  IncomeByCostCenterPaymentMethodRow;

export async function getIncomeByCostCenterPaymentMethodAction(): Promise<
  IncomeByCostCenterPaymentMethodDTO[]
> {
  const currentUser = await getCurrentUserWithRole();

  if (!currentUser) {
    return [];
  }

  const isAdmin = currentUser.roleName === "admin";

  if (isAdmin) {
    return getIncomeByCostCenterPaymentMethod();
  }

  if (!currentUser.centroCostoId) {
    return [];
  }

  return getIncomeByCostCenterPaymentMethod([currentUser.centroCostoId]);
}

"use server";

import {
  listInventoryMovementProducts,
  listInventoryMovementTypes,
} from "@/data/repositories/inventory-movements.repository";

export interface InventoryMovementFormData {
  products: Awaited<ReturnType<typeof listInventoryMovementProducts>>;
  movementTypes: Awaited<ReturnType<typeof listInventoryMovementTypes>>;
}

export async function getInventoryMovementFormDataAction(): Promise<InventoryMovementFormData> {
  const [products, movementTypes] = await Promise.all([
    listInventoryMovementProducts(),
    listInventoryMovementTypes(),
  ]);

  return {
    products,
    movementTypes,
  };
}

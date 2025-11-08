"use server";

import {
  listInventoryMovementProducts,
  listInventoryMovementTypes,
} from "@/data/repositories/inventory.movements.repository";

export async function getMovementFormProducts() {
  return await listInventoryMovementProducts();
}

export async function getMovementFormTypes() {
  return await listInventoryMovementTypes();
}

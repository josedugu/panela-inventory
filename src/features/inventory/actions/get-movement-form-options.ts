"use server";

import {
  listInventoryMovementProducts,
  listInventoryMovementTypes,
} from "@/data/repositories/inventory.movements.repository";
import { listSuppliers } from "@/data/repositories/suppliers.repository";
import { listWarehouses } from "@/data/repositories/warehouses.repository";

export async function getMovementFormProducts() {
  return await listInventoryMovementProducts();
}

export async function getMovementFormTypes() {
  return await listInventoryMovementTypes();
}

export async function getMovementFormWarehouses() {
  return await listWarehouses();
}

export async function getMovementFormSuppliers() {
  return await listSuppliers();
}

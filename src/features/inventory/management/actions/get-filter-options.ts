"use server";

import {
  getInventoryFilterOptions,
  type InventoryFilterOptions,
} from "@/data/repositories/products.repository";

export async function getInventoryFilterOptionsAction(): Promise<InventoryFilterOptions> {
  try {
    return await getInventoryFilterOptions();
  } catch {
    throw new Error("No se pudieron cargar los filtros de inventario");
  }
}

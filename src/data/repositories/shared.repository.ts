import "server-only";

import { Prisma } from "@prisma/client";

// Re-exportar funciones de lectura y DTOs desde los archivos individuales
// para que puedan ser usadas desde múltiples lugares
export type { BrandDTO } from "./brands.repository";
// Re-exportar funciones
export { listBrands } from "./brands.repository";
export type { ColorDTO } from "./colors.repository";
export { listColors } from "./colors.repository";
export type { CostCenterDTO } from "./costCenters.repository";
export { listCostCenters } from "./costCenters.repository";
export type { ModelDTO } from "./models.repository";
export { listModels } from "./models.repository";
export type { RamDTO } from "./ram.repository";
export { listRamOptions } from "./ram.repository";
export type { StorageDTO } from "./storage.repository";
export { listStorageOptions } from "./storage.repository";
export type { TipoProductoDTO } from "./tipo-producto.repository";
export { listTipoProductos } from "./tipo-producto.repository";

// Utilidad compartida
export function isPrismaKnownError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

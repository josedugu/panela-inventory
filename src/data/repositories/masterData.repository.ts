import "server-only";

export * from "./brands.repository";
export * from "./colors.repository";
export * from "./costCenters.repository";
export type { ProductDTO } from "./master.products.repository";
export * from "./master.products.repository";
export * from "./models.repository";
export * from "./ram.repository";
// Re-exportar todo desde los archivos individuales para mantener compatibilidad
export * from "./shared.repository";
export * from "./storage.repository";
// Re-exportar tipos específicos que pueden estar siendo usados
export type { SupplierDTO } from "./suppliers.repository";
export * from "./suppliers.repository";
export * from "./tipo-producto.repository";
export type { UserDTO } from "./users.repository";
export * from "./users.repository";
export type { WarehouseDTO } from "./warehouses.repository";
export * from "./warehouses.repository";

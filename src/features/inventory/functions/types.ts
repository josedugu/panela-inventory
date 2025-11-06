import type { InventoryProductDTO } from "../management/actions/get-products";

export type NumericOperator = ">=" | "<=" | "=";

export type InventoryProduct = InventoryProductDTO;

export type InventoryStatus = InventoryProduct["status"];

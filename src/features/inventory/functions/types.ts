import type { InventoryProductDTO } from "../management/actions/get-products";

export type NumericOperator = ">=" | "<=" | "=";

export type InventoryProduct = InventoryProductDTO & {
  bodegas?: string[];
  foundByImei?: boolean;
  matchedImei?: string;
  matchedProductDetailId?: string;
};

export type InventoryStatus = InventoryProduct["status"];

import type { InventoryStatus, NumericOperator } from "../functions/types";

export const NUMERIC_OPERATOR_OPTIONS: Array<{
  value: NumericOperator;
  label: string;
}> = [
  { value: ">=", label: "Mayor o igual que" },
  { value: "=", label: "Igual a" },
  { value: "<=", label: "Menor o igual que" },
];

export const STATUS_LABELS: Record<InventoryStatus, string> = {
  "in-stock": "En stock",
  "low-stock": "Stock bajo",
  "out-of-stock": "Sin stock",
};

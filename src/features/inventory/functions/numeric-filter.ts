import type { NumericOperator } from "./types";

export function parseNumericFilterValue(rawValue: string | undefined): {
  operator: NumericOperator;
  amount: string;
} {
  if (!rawValue) {
    return { operator: ">=", amount: "" };
  }

  const match = rawValue.match(/^(>=|<=|=)\s*(\d+(?:\.\d*)?)$/);

  if (!match) {
    return { operator: ">=", amount: "" };
  }

  return {
    operator: match[1] as NumericOperator,
    amount: match[2],
  };
}

export function formatNumericFilterValue(
  operator: NumericOperator,
  amount: string,
): string | undefined {
  const normalizedAmount = amount.trim();
  if (!normalizedAmount) {
    return undefined;
  }

  return `${operator} ${normalizedAmount}`;
}

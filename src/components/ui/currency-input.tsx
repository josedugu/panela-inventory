"use client";

import type { ChangeEvent, ComponentProps, FocusEvent } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatterParts = currencyFormatter.formatToParts(1234567.89);
const decimalSeparator =
  formatterParts.find((part) => part.type === "decimal")?.value ?? ",";
const groupSeparator =
  formatterParts.find((part) => part.type === "group")?.value ?? ".";
const currencySymbol =
  formatterParts.find((part) => part.type === "currency")?.value ?? "$";

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const groupSeparatorRegex = groupSeparator
  ? new RegExp(escapeRegExp(groupSeparator), "g")
  : null;
const currencySymbolRegex = new RegExp(escapeRegExp(currencySymbol), "g");

const normalizeInputValue = (rawValue: string) => {
  if (!rawValue) {
    return "";
  }

  let cleanedValue = rawValue
    .replace(currencySymbolRegex, "")
    .replace(/\u00a0/g, "")
    .replace(/\s/g, "");

  if (groupSeparatorRegex) {
    cleanedValue = cleanedValue.replace(groupSeparatorRegex, "");
  }

  cleanedValue = cleanedValue.replace(/[^0-9.,]/g, "").replace(/,/g, ".");

  if (!cleanedValue) {
    return "";
  }

  const [integerPartRaw = "", ...decimalParts] = cleanedValue.split(".");
  const decimalsRaw = decimalParts.join("");
  const endsWithDecimal =
    cleanedValue.endsWith(".") && decimalsRaw.length === 0;

  let integerPart = integerPartRaw.replace(/^0+(?=\d)/, "");
  if (!integerPart && (decimalsRaw || endsWithDecimal)) {
    integerPart = "0";
  }

  if (!integerPart && !decimalsRaw && !endsWithDecimal) {
    return "";
  }

  const limitedDecimals = decimalsRaw.slice(0, 2);

  if (limitedDecimals) {
    return `${integerPart || "0"}.${limitedDecimals}`;
  }

  if (endsWithDecimal) {
    return `${integerPart || "0"}.`;
  }

  return integerPart || "0";
};

const formatNumericValue = (numericValue: string) => {
  if (!numericValue) {
    return "";
  }

  const hasTrailingDecimal = numericValue.endsWith(".");
  const normalizedValue = hasTrailingDecimal
    ? numericValue.slice(0, -1)
    : numericValue;
  const [integerPart = "0", decimalPart = ""] = normalizedValue.split(".");
  const integerValue = Number.parseInt(integerPart || "0", 10);

  if (Number.isNaN(integerValue) || integerValue < 0) {
    return "";
  }

  const formattedInteger = currencyFormatter.format(integerValue);

  if (hasTrailingDecimal) {
    return `${formattedInteger}${decimalSeparator}`;
  }

  if (decimalPart) {
    return `${formattedInteger}${decimalSeparator}${decimalPart}`;
  }

  return formattedInteger;
};

const getCursorNumericValueLength = (value: string, cursorPosition: number) => {
  if (!value) {
    return 0;
  }

  const partialValue = value.slice(0, cursorPosition);
  return normalizeInputValue(partialValue).length;
};

const getCursorPosition = (formattedValue: string, targetIndex: number) => {
  if (!formattedValue) {
    return 0;
  }

  if (targetIndex <= 0) {
    const firstDigit = formattedValue.search(/\d/);
    return firstDigit === -1 ? 0 : firstDigit;
  }

  let normalizedIndex = 0;
  for (let i = 0; i < formattedValue.length; i += 1) {
    const char = formattedValue[i];
    if (/\d/.test(char)) {
      normalizedIndex += 1;
    } else if (char === decimalSeparator) {
      normalizedIndex += 1;
    }

    if (normalizedIndex >= targetIndex) {
      return i + 1;
    }
  }

  return formattedValue.length;
};

interface CurrencyInputProps
  extends Omit<ComponentProps<"input">, "type" | "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export function CurrencyInput({
  value,
  onChange,
  onBlur,
  className,
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [numericValue, setNumericValue] = useState("");

  useEffect(() => {
    const normalizedExternalValue = normalizeInputValue(value);
    setNumericValue(normalizedExternalValue);
    setDisplayValue(
      normalizedExternalValue
        ? formatNumericValue(normalizedExternalValue)
        : "",
    );
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputElement = event.target;
    const incomingValue = inputElement.value;
    const cursorPosition = inputElement.selectionStart ?? incomingValue.length;
    const cursorNumericIndex = getCursorNumericValueLength(
      incomingValue,
      cursorPosition,
    );
    const normalizedNumericValue = normalizeInputValue(incomingValue);

    if (!normalizedNumericValue) {
      setNumericValue("");
      setDisplayValue("");
      onChange("");
      requestAnimationFrame(() => {
        if (typeof inputElement.setSelectionRange === "function") {
          inputElement.setSelectionRange(0, 0);
        }
      });
      return;
    }

    setNumericValue(normalizedNumericValue);
    const formattedValue = formatNumericValue(normalizedNumericValue);
    setDisplayValue(formattedValue);
    onChange(normalizedNumericValue);

    requestAnimationFrame(() => {
      if (typeof inputElement.setSelectionRange !== "function") {
        return;
      }

      const nextCursor = getCursorPosition(formattedValue, cursorNumericIndex);
      inputElement.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setDisplayValue(numericValue ? formatNumericValue(numericValue) : "");
    onBlur?.(event);
  };

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={cn("text-right", className)}
      {...props}
    />
  );
}

"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NUMERIC_OPERATOR_OPTIONS } from "../conts/filters";
import {
  formatNumericFilterValue,
  parseNumericFilterValue,
} from "../functions/numeric-filter";
import type { NumericOperator } from "../functions/types";

interface NumericFilterFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  step?: string;
  placeholder?: string;
}

export function NumericFilterField({
  label,
  value,
  onChange,
  step = "1",
  placeholder,
}: NumericFilterFieldProps) {
  const parsedValue = parseNumericFilterValue(value);
  const operatorRef = useRef<NumericOperator>(parsedValue.operator);

  if (value) {
    operatorRef.current = parsedValue.operator;
  }

  const amount = value ? parsedValue.amount : "";

  const handleOperatorChange = (nextOperator: string) => {
    operatorRef.current = nextOperator as NumericOperator;
    if (!amount) {
      onChange(undefined);
      return;
    }

    onChange(formatNumericFilterValue(operatorRef.current, amount));
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextAmount = event.target.value;
    if (!nextAmount.trim()) {
      onChange(undefined);
      return;
    }

    onChange(formatNumericFilterValue(operatorRef.current, nextAmount));
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <div className="flex gap-2">
        <Select
          value={operatorRef.current}
          onValueChange={handleOperatorChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecciona un operador" />
          </SelectTrigger>
          <SelectContent side="top">
            {NUMERIC_OPERATOR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          inputMode={step === "1" ? "numeric" : "decimal"}
          min="0"
          step={step}
          value={amount}
          placeholder={placeholder ?? "0"}
          onChange={handleAmountChange}
        />
      </div>
    </div>
  );
}

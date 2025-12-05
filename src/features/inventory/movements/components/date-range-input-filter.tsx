"use client";

import { CalendarCheck } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DateRangeInputFilterProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

/**
 * Parses a date range string in the format "YYYY-MM-DD..YYYY-MM-DD"
 */
function parseRangeValue(value: string | undefined): {
  from: string;
  to: string;
} {
  if (!value) return { from: "", to: "" };
  const [from = "", to = ""] = value.split("..");
  return { from, to };
}

/**
 * Formats date values to range string format
 */
function formatRangeValue(from: string, to: string): string | undefined {
  if (!from && !to) return undefined;
  return `${from}..${to}`;
}

/**
 * Returns today's date in YYYY-MM-DD format
 */
function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DateRangeInputFilter({
  label,
  value,
  onChange,
}: DateRangeInputFilterProps) {
  const { from, to } = useMemo(() => parseRangeValue(value), [value]);

  const handleFromChange = (nextFrom: string) => {
    onChange(formatRangeValue(nextFrom, to));
  };

  const handleToChange = (nextTo: string) => {
    onChange(formatRangeValue(from, nextTo));
  };

  const handleSetToday = () => {
    const today = getTodayString();
    onChange(formatRangeValue(today, today));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSetToday}
          className="h-6 px-2 text-xs text-primary hover:text-primary/80"
          title="Establecer fecha de hoy"
        >
          <CalendarCheck className="h-3 w-3 mr-1" />
          Hoy
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label
            htmlFor="date-range-from"
            className="text-xs text-text-tertiary mb-1 block"
          >
            Desde
          </label>
          <Input
            id="date-range-from"
            type="date"
            value={from}
            onChange={(e) => handleFromChange(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="date-range-to"
            className="text-xs text-text-tertiary mb-1 block"
          >
            Hasta
          </label>
          <Input
            id="date-range-to"
            type="date"
            value={to}
            onChange={(e) => handleToChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      <p className="text-xs text-text-tertiary">
        Usa la misma fecha en ambos campos para buscar un solo día
      </p>
    </div>
  );
}

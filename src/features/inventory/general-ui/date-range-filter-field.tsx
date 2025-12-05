import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
});

type ParsedRange = {
  from?: Date;
  to?: Date;
};

const normalizeRangeValue = (value: string | undefined): ParsedRange => {
  if (!value) return {};
  const [fromRaw = "", toRaw = ""] = value.split("..");

  const from = fromRaw ? new Date(fromRaw) : undefined;
  const to = toRaw ? new Date(toRaw) : undefined;

  return {
    from: Number.isNaN(from?.getTime()) ? undefined : from,
    to: Number.isNaN(to?.getTime()) ? undefined : to,
  };
};

const formatRangeValue = (range: DateRange | undefined): string | undefined => {
  if (!range || (!range.from && !range.to)) return undefined;

  const from = range.from ? range.from.toISOString().slice(0, 10) : "";
  const to = range.to ? range.to.toISOString().slice(0, 10) : "";

  return `${from}..${to}`;
};

const formatDisplayLabel = (range: ParsedRange): string => {
  const hasFrom = Boolean(range.from);
  const hasTo = Boolean(range.to);

  if (hasFrom && hasTo && range.from && range.to) {
    return `${dateFormatter.format(range.from)} - ${dateFormatter.format(range.to)}`;
  }

  if (hasFrom && range.from) {
    return `Desde ${dateFormatter.format(range.from)}`;
  }

  if (hasTo && range.to) {
    return `Hasta ${dateFormatter.format(range.to)}`;
  }

  return "Selecciona un rango";
};

interface DateRangeFilterFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export function DateRangeFilterField({
  label,
  value,
  onChange,
}: DateRangeFilterFieldProps) {
  const [open, setOpen] = useState(false);
  const parsedRange = useMemo(() => normalizeRangeValue(value), [value]);
  const selectedRange = useMemo<DateRange | undefined>(() => {
    if (!parsedRange.from && !parsedRange.to) return undefined;
    return {
      from: parsedRange.from ?? parsedRange.to,
      to: parsedRange.to ?? parsedRange.from,
    };
  }, [parsedRange.from, parsedRange.to]);

  const displayLabel = useMemo(
    () => formatDisplayLabel(parsedRange),
    [parsedRange],
  );

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between min-h-11"
          >
            <span className="truncate">{displayLabel}</span>
            <CalendarIcon className="h-4 w-4 text-text-secondary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={(nextRange) => {
              onChange(formatRangeValue(nextRange));
            }}
            numberOfMonths={2}
            defaultMonth={selectedRange?.from}
          />
          <div className="flex justify-end gap-2 px-3 pb-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(undefined)}
            >
              Limpiar
            </Button>
            <Button type="button" size="sm" onClick={() => setOpen(false)}>
              Listo
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

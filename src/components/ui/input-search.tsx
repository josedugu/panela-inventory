"use client";

import { ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./utils";

export interface InputSearchOption {
  label: string;
  value: string;
}

interface InputSearchProps {
  label?: string;
  placeholder?: string;
  value?: InputSearchOption;
  onChange: (option?: InputSearchOption) => void;
  options: InputSearchOption[];
  disabled?: boolean;
  loading?: boolean;
  maxOptions?: number;
  className?: string;
}

export function InputSearch({
  label,
  placeholder = "Buscar...",
  value,
  onChange,
  options,
  disabled,
  loading,
  maxOptions = 3,
  className,
}: InputSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!open && !value) {
      return options.slice(0, maxOptions);
    }

    const query = search.trim().toLowerCase();
    if (query.length === 0) {
      return options.slice(0, maxOptions);
    }

    return options
      .filter((option) => option.label.toLowerCase().includes(query))
      .slice(0, maxOptions);
  }, [open, search, options, maxOptions, value]);

  const handleSelect = (option: InputSearchOption | undefined) => {
    onChange(option);
    setOpen(false);
  };

  const normalizedValue = value?.label ?? "";
  const customOption: InputSearchOption | undefined = search.trim().length
    ? { label: search.trim(), value: search.trim() }
    : undefined;

  const hasExactMatch = customOption
    ? options.some(
        (option) =>
          option.value.toLowerCase() === customOption.value.toLowerCase(),
      )
    : false;

  return (
    <div className={cn(label ? "space-y-2" : "", className)}>
      {label && (
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between min-w-0"
          >
            <span
              className={cn(
                "truncate min-w-0",
                !value && "text-text-secondary",
              )}
            >
              {normalizedValue || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={placeholder}
            />
            <CommandList>
              {loading ? (
                <CommandEmpty>
                  <span className="flex items-center gap-2 text-sm text-text-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
                  </span>
                </CommandEmpty>
              ) : filteredOptions.length === 0 && !customOption ? (
                <CommandEmpty>Sin resultados</CommandEmpty>
              ) : null}
              {!loading && value && (
                <CommandItem
                  value="__clear__"
                  onSelect={() => handleSelect(undefined)}
                >
                  Limpiar selección
                </CommandItem>
              )}
              {!loading &&
                filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={() => handleSelect(option)}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              {!loading && customOption && !hasExactMatch && (
                <CommandGroup heading="Personalizado">
                  <CommandItem
                    value={customOption.value}
                    onSelect={() => handleSelect(customOption)}
                  >
                    Usar "{customOption.label}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

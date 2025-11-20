"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
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

interface InputSearchDBProps {
  label?: string;
  placeholder?: string;
  value?: InputSearchOption;
  onChange: (option?: InputSearchOption) => void;
  searchFn: (query: string) => Promise<InputSearchOption[]>;
  disabled?: boolean;
  maxOptions?: number;
  className?: string;
  debounceMs?: number;
  queryKeyBase?: string;
  valueClassName?: string;
}

export function InputSearchDB({
  label,
  placeholder = "Buscar...",
  value,
  onChange,
  searchFn,
  disabled,
  maxOptions = 10,
  className,
  debounceMs = 300,
  queryKeyBase,
  valueClassName,
}: InputSearchDBProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  // Debounce del término de búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  // Búsqueda en la BD solo cuando hay texto o cuando está abierto sin valor
  const shouldSearch = open && (debouncedSearch.trim().length > 0 || !value);
  const queryKeyPrefix = queryKeyBase ?? label ?? placeholder ?? "search-db";

  const { data: options = [], isLoading } = useQuery({
    queryKey: ["search-db", queryKeyPrefix, debouncedSearch],
    queryFn: () => searchFn(debouncedSearch.trim()),
    enabled: shouldSearch,
    staleTime: 1000,
  });

  const filteredOptions = useMemo(() => {
    if (!open) {
      return [];
    }

    // Si hay un valor seleccionado y no hay búsqueda, mostrar solo ese
    if (value && !debouncedSearch.trim()) {
      return [value];
    }

    return options.slice(0, maxOptions);
  }, [open, options, maxOptions, value, debouncedSearch]);

  const handleSelect = (option: InputSearchOption | undefined) => {
    onChange(option);
    setOpen(false);
  };

  const normalizedValue = value?.label ?? "";

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
            className="w-full justify-between min-w-0 items-start whitespace-normal text-left py-2 h-auto min-h-11"
          >
            <span
              className={cn(
                "min-w-0 text-left",
                valueClassName ?? "truncate",
                !value && "text-text-secondary",
              )}
            >
              {normalizedValue || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[400px] p-0 overflow-hidden"
          align="start"
          onWheel={(e) => {
            // Permitir que el scroll funcione dentro del popover
            e.stopPropagation();
          }}
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={placeholder}
            />
            <CommandList
              className="max-h-[300px] overflow-y-auto overscroll-contain"
              onWheel={(e) => {
                // Asegurar que el scroll funcione con la rueda del mouse
                e.stopPropagation();
                const target = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = target;
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

                if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
                  // Prevenir el scroll del contenedor padre si estamos en los límites
                  e.preventDefault();
                }
              }}
            >
              {isLoading ? (
                <CommandEmpty key="loading">
                  <span className="flex items-center gap-2 text-sm text-text-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                  </span>
                </CommandEmpty>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty key="empty">
                  {debouncedSearch.trim()
                    ? "Sin resultados"
                    : "Escribe para buscar"}
                </CommandEmpty>
              ) : (
                <>
                  {value && (
                    <CommandItem
                      key="__clear__"
                      value="__clear__"
                      onSelect={() => handleSelect(undefined)}
                      className="cursor-pointer"
                    >
                      Limpiar selección
                    </CommandItem>
                  )}
                  {filteredOptions.map((option, index) => (
                    <CommandItem
                      key={`${option.value}-${index}`}
                      value={`${option.label} ${option.value}`}
                      onSelect={() => handleSelect(option)}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

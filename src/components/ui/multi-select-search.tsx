"use client";

import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import type { InputSearchOption } from "./input-search";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

interface MultiSelectSearchProps {
  label?: string;
  placeholder?: string;
  value?: InputSearchOption[];
  onChange: (options: InputSearchOption[]) => void;
  options: InputSearchOption[];
  disabled?: boolean;
  loading?: boolean;
  maxOptions?: number;
  maxSelections?: number;
  showSelectedCount?: boolean;
  className?: string;
}

export function MultiSelectSearch({
  label,
  placeholder = "Buscar...",
  value = [],
  onChange,
  options,
  disabled,
  loading,
  maxOptions = 10,
  maxSelections,
  showSelectedCount = true,
  className,
}: MultiSelectSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const selectedValues = value || [];

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) {
      return options.slice(0, maxOptions);
    }

    return options
      .filter((option) => option.label.toLowerCase().includes(query))
      .slice(0, maxOptions);
  }, [search, options, maxOptions]);

  const isSelected = (option: InputSearchOption) => {
    return selectedValues.some((selected) => selected.value === option.value);
  };

  const handleToggle = (option: InputSearchOption) => {
    if (isSelected(option)) {
      // Remover si ya está seleccionado
      onChange(selectedValues.filter((v) => v.value !== option.value));
    } else {
      // Agregar si no está seleccionado y no excede el máximo
      if (maxSelections && selectedValues.length >= maxSelections) {
        return; // No agregar si se alcanzó el máximo
      }
      onChange([...selectedValues, option]);
    }
    // No cerrar el popover para permitir múltiples selecciones
  };

  const handleRemove = (option: InputSearchOption, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v.value !== option.value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

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
            className="w-full justify-between min-h-10 h-auto py-2"
          >
            <div className="flex flex-1 items-center gap-1 flex-wrap min-w-0">
              {selectedValues.length === 0 ? (
                <span className="text-text-secondary truncate">
                  {placeholder}
                </span>
              ) : selectedValues.length <= 2 ? (
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                  {selectedValues.map((selected) => (
                    <Badge
                      key={selected.value}
                      variant="secondary"
                      className="text-xs"
                    >
                      {selected.label}
                      <button
                        type="button"
                        className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => handleRemove(selected, e)}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="flex gap-1 flex-wrap">
                    {selectedValues.slice(0, 2).map((selected) => (
                      <Badge
                        key={selected.value}
                        variant="secondary"
                        className="text-xs"
                      >
                        {selected.label}
                        <button
                          type="button"
                          className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => handleRemove(selected, e)}
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {showSelectedCount && (
                    <span className="text-sm text-text-secondary">
                      +{selectedValues.length - 2} más
                    </span>
                  )}
                </div>
              )}
            </div>
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
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty>Sin resultados</CommandEmpty>
              ) : null}
              {!loading && selectedValues.length > 0 && (
                <CommandItem
                  value="__clear_all__"
                  onSelect={handleClearAll}
                  className="text-destructive focus:text-destructive"
                >
                  Limpiar todas las selecciones
                </CommandItem>
              )}
              {!loading &&
                filteredOptions.map((option) => {
                  const selected = isSelected(option);
                  const disabled =
                    maxSelections !== undefined &&
                    !selected &&
                    selectedValues.length >= maxSelections;

                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value}`}
                      onSelect={() => handleToggle(option)}
                      disabled={disabled}
                      className={cn(
                        disabled && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="flex-1">{option.label}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              {!loading &&
                maxSelections &&
                selectedValues.length >= maxSelections && (
                  <CommandEmpty className="py-2 text-xs text-text-secondary">
                    Máximo {maxSelections} selección(es) permitida(s)
                  </CommandEmpty>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

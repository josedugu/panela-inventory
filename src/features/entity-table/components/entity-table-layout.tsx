"use client";

import { Check, Eraser, Filter, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataGrid } from "@/components/ui/data-grid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExportDropdown } from "@/components/ui/export-dropdown";
import { Input } from "@/components/ui/input";
import { InputSearch } from "@/components/ui/input-search";
import { Skeleton } from "@/components/ui/skeleton";
import { useExportData } from "@/hooks/use-export-data";
import { cn } from "@/lib/utils";
import type { EntityTableLayoutProps } from "../types";

export function EntityTableLayout<TData>({
  config,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  searchValue,
  onSearchChange,
  filters,
  filterState,
  onFilterStateChange,
  pendingFilterState,
  onPendingFilterStateChange,
  onApplyFilters,
  onResetPendingFilters,
  onClearFilters,
  isFilterDialogOpen,
  setFilterDialogOpen,
  filterOptions,
  isLoadingFilterOptions,
  renderExtraContent,
  className,
  contentClassName,
  searchContainerClassName,
  filterTriggerClassName,
  filtersChipsWrapperClassName,
}: EntityTableLayoutProps<TData>) {
  const hasFilters = Boolean(
    filters &&
      filterState &&
      onFilterStateChange &&
      pendingFilterState &&
      onPendingFilterStateChange &&
      onApplyFilters &&
      onResetPendingFilters &&
      onClearFilters &&
      isFilterDialogOpen !== undefined &&
      setFilterDialogOpen,
  );

  const activeFilters = hasFilters
    ? Object.entries(filterState ?? {}).filter(([, value]) => value)
    : [];
  const activeFiltersCount = activeFilters.length;

  const searchPlaceholder = config.searchPlaceholder ?? "Buscar...";
  const filterDialogTitle = config.filterDialogTitle ?? "Filtrar resultados";
  const filterDialogDescription =
    config.filterDialogDescription ??
    "Selecciona uno o varios filtros y aplica para actualizar la tabla.";

  const { exportData } = useExportData<TData>();

  const handleExport = (format: "csv" | "xlsx" | "pdf") => {
    exportData(format, {
      data,
      columns: config.columns,
      title: config.title.toLowerCase().replace(/\s+/g, "_"),
    });
  };

  const handleOpenFilters = () => {
    if (
      hasFilters &&
      onPendingFilterStateChange &&
      filterState &&
      setFilterDialogOpen
    ) {
      onPendingFilterStateChange({ ...filterState });
      setFilterDialogOpen(true);
    }
  };

  const handleRemoveFilter = (key: string) => {
    if (
      !hasFilters ||
      !onFilterStateChange ||
      !filterState ||
      !onPendingFilterStateChange ||
      !pendingFilterState
    )
      return;
    const updated = { ...filterState };
    delete updated[key];
    onFilterStateChange(updated);
    const pendingUpdated = { ...pendingFilterState };
    delete pendingUpdated[key];
    onPendingFilterStateChange(pendingUpdated);
  };

  const handleClearFilters = () => {
    if (hasFilters && onClearFilters) {
      onClearFilters();
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (
      !hasFilters ||
      !setFilterDialogOpen ||
      !onPendingFilterStateChange ||
      !filterState
    )
      return;
    setFilterDialogOpen(open);
    if (open) {
      onPendingFilterStateChange({ ...filterState });
    }
  };

  const renderActionButtons = () => (
    <div className="flex gap-2">
      {config.exportAction !== false &&
        (config.exportAction?.onClick ? (
          <Button
            variant="outline"
            size="sm"
            onClick={config.exportAction.onClick}
          >
            {config.exportAction.label ?? "Exportar"}
          </Button>
        ) : (
          <ExportDropdown
            onExport={handleExport}
            disabled={!data || data.length === 0}
          />
        ))}
      {config.addAction ? (
        <Button size="sm" onClick={config.addAction.onClick}>
          {config.addAction.label}
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className={cn("flex h-full flex-col space-y-6 p-4 lg:p-6", className)}>
      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
          contentClassName,
        )}
      >
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            {config.title}
          </h1>
          {config.description ? (
            <p className="text-text-secondary mt-1">{config.description}</p>
          ) : null}
        </div>
        {renderActionButtons()}
      </div>

      {renderExtraContent}

      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-center",
          searchContainerClassName,
        )}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => {
              onSearchChange(event.target.value);
              onPageChange(1);
            }}
            className="pl-10"
          />
        </div>

        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenFilters}
            className={cn(
              "w-full sm:w-auto justify-between sm:justify-start gap-2",
              filterTriggerClassName,
            )}
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {hasFilters && activeFiltersCount > 0 && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            filtersChipsWrapperClassName,
          )}
        >
          {activeFilters.map(([key, value]) => (
            <Badge
              key={`${key}-${value}`}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <span>
                {filters?.find((filter) => filter.key === key)?.label ?? key}:{" "}
                {value}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFilter(key)}
                className="text-text-secondary transition-colors hover:text-text"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Quitar filtro</span>
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Limpiar filtros
          </Button>
        </div>
      )}

      {hasFilters && (
        <Dialog
          open={isFilterDialogOpen ?? false}
          onOpenChange={handleDialogChange}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
            <DialogHeader>
              <DialogTitle>{filterDialogTitle}</DialogTitle>
              <DialogDescription>{filterDialogDescription}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              {filters?.map((filter) => {
                if (filter.type === "custom" && filter.render) {
                  return (
                    <div key={filter.key} className="space-y-2">
                      {filter.render({
                        value: pendingFilterState?.[filter.key],
                        onChange: (value) =>
                          onPendingFilterStateChange?.({
                            ...pendingFilterState,
                            [filter.key]: value,
                          }),
                      })}
                    </div>
                  );
                }

                const options = filterOptions?.[filter.key] ?? [];
                const currentValue = pendingFilterState?.[filter.key];

                if (isLoadingFilterOptions && options.length === 0) {
                  return (
                    <div key={filter.key} className="space-y-2">
                      <span className="text-sm font-medium text-text-secondary">
                        {filter.label}
                      </span>
                      <Skeleton className="h-11 w-full" />
                    </div>
                  );
                }

                return (
                  <InputSearch
                    key={filter.key}
                    label={filter.label}
                    options={options}
                    value={
                      currentValue
                        ? {
                            label: currentValue,
                            value: currentValue,
                          }
                        : undefined
                    }
                    onChange={(option) =>
                      onPendingFilterStateChange?.({
                        ...pendingFilterState,
                        [filter.key]: option?.value,
                      })
                    }
                    maxOptions={filter.maxOptions ?? 7}
                    loading={isLoadingFilterOptions && options.length === 0}
                    placeholder={`Selecciona o escribe ${filter.label.toLowerCase()}`}
                  />
                );
              })}
            </div>

            <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={onResetPendingFilters}
                className="w-full sm:w-auto sm:mr-auto"
              >
                <Eraser className="mr-2 h-4 w-4" />
                Limpiar selección
              </Button>
              <div className="flex w-full flex-col-reverse sm:flex-row sm:w-auto gap-2">
                <Button
                  type="button"
                  onClick={onApplyFilters}
                  disabled={isLoadingFilterOptions}
                  className="w-full sm:w-auto"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Aplicar filtros
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <DataGrid
        data={data}
        columns={config.columns}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange,
          onPageSizeChange,
        }}
        onView={config.onView}
        onEdit={config.onEdit}
        onDelete={config.onDelete}
        onDuplicate={config.onDuplicate}
        getRowId={config.getRowId}
        showIndexColumn={config.showIndexColumn ?? false}
        getIndexValue={config.getIndexValue}
      />
    </div>
  );
}

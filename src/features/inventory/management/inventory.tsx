"use client";

import { useQuery } from "@tanstack/react-query";
import type { ChangeEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import { useEntityFilters } from "@/features/entity-table/hooks/use-entity-filters";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import { NUMERIC_OPERATOR_OPTIONS, STATUS_LABELS } from "../conts/filters";
import {
  formatNumericFilterValue,
  parseNumericFilterValue,
} from "../functions/numeric-filter";
import type {
  InventoryProduct,
  InventoryStatus,
  NumericOperator,
} from "../functions/types";
import {
  type InventoryMovementInitialData,
  InventoryMovementModal,
} from "../general-ui/add-product-modal";
import { getInventoryFilterOptionsAction } from "./actions/get-filter-options";
import {
  getProductLocationsAction,
  type ProductLocation,
} from "./actions/get-product-locations";
import {
  type GetProductsSuccess,
  getProductsAction,
} from "./actions/get-products";
import { getInventoryColumns } from "./columns";

interface NumericFilterFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  step?: string;
  placeholder?: string;
}

function NumericFilterField({
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

export function Inventory() {
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementModalInitialData, setMovementModalInitialData] =
    useState<InventoryMovementInitialData>();
  const [movementModalKey, setMovementModalKey] = useState(0);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  const [locations, setLocations] = useState<ProductLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [clientSearch, setClientSearch] = useState("");

  const filterDescriptors = useMemo<EntityFilterDescriptor[]>(
    () => [
      {
        key: "category",
        label: "Categoría",
        type: "input-search",
      },
      {
        key: "brand",
        label: "Marca",
        type: "input-search",
      },
      {
        key: "model",
        label: "Modelo",
        type: "input-search",
      },
      {
        key: "storage",
        label: "Almacenamiento",
        type: "input-search",
      },
      {
        key: "color",
        label: "Color",
        type: "input-search",
      },
      {
        key: "imei",
        label: "IMEI",
        type: "input-search",
        maxOptions: 5,
      },
      {
        key: "supplier",
        label: "Proveedor",
        type: "input-search",
      },
      {
        key: "status",
        label: "Estado",
        type: "input-search",
      },
      {
        key: "cost",
        label: "Costo",
        type: "custom",
        render: ({ value, onChange }) => (
          <NumericFilterField
            label="Costo"
            value={value}
            onChange={onChange}
            step="0.01"
            placeholder="0.00"
          />
        ),
      },
      {
        key: "quantity",
        label: "Cantidad",
        type: "custom",
        render: ({ value, onChange }) => (
          <NumericFilterField
            label="Cantidad"
            value={value}
            onChange={onChange}
            step="1"
            placeholder="0"
          />
        ),
      },
    ],
    [],
  );

  const {
    filterState,
    setFilterState,
    pendingFilterState,
    setPendingFilterState,
    applyFilters,
    resetPendingFilters,
    clearFilters,
    filtersKey,
    isDialogOpen,
    setDialogOpen,
    normalizedOptions,
  } = useEntityFilters({
    filters: filterDescriptors,
  });

  const { data, isLoading, isFetching, refetch } = useQuery<GetProductsSuccess>(
    {
      queryKey: ["products", page, pageSize, filtersKey],
      queryFn: async () => {
        const result = await getProductsAction({
          page,
          pageSize,
          filters: filterState,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        return result;
      },
      refetchInterval: 30000,
      placeholderData: (previousData) => previousData,
    },
  );

  const { data: filterOptions, isLoading: isLoadingFilterOptions } = useQuery({
    queryKey: ["inventory", "filter-options"],
    queryFn: getInventoryFilterOptionsAction,
    enabled: isDialogOpen,
    staleTime: Infinity,
  });

  const filterOptionsMap = useMemo(() => {
    const base = { ...normalizedOptions } as Record<
      string,
      { label: string; value: string }[]
    >;

    if (filterOptions) {
      // Mapear todas las opciones disponibles desde el servidor
      base.category = filterOptions.categories.map((value) => ({
        label: value,
        value,
      }));
      base.brand = filterOptions.brands.map((value) => ({
        label: value,
        value,
      }));
      base.model = filterOptions.models.map((value) => ({
        label: value,
        value,
      }));
      base.storage = filterOptions.storages.map((value) => ({
        label: value,
        value,
      }));
      base.color = filterOptions.colors.map((value) => ({
        label: value,
        value,
      }));
      base.supplier = filterOptions.suppliers.map((value) => ({
        label: value,
        value,
      }));
      base.status = filterOptions.statuses.map((value) => ({
        value,
        label: STATUS_LABELS[value as InventoryStatus] ?? value,
      }));
    } else {
      // Si no hay opciones del servidor, usar valores por defecto
      base.status = (base.status ??
        Object.keys(STATUS_LABELS).map((value) => ({
          value,
          label: STATUS_LABELS[value as InventoryStatus] ?? value,
        }))) as { label: string; value: string }[];
    }

    // Asegurar que status siempre tenga valores por defecto
    base.status ??= Object.keys(STATUS_LABELS).map((value) => ({
      value,
      label: STATUS_LABELS[value as InventoryStatus] ?? value,
    }));

    // Inicializar arrays vacíos para campos que no tienen opciones del servidor
    base.category ??= [];
    base.brand ??= [];
    base.model ??= [];
    base.storage ??= [];
    base.color ??= [];
    base.supplier ??= [];
    // IMEI no tiene opciones predefinidas, se busca dinámicamente

    return base;
  }, [filterOptions, normalizedOptions]);

  const isLoadingFilters = isLoadingFilterOptions && !filterOptions;

  const filteredData = useMemo(() => {
    const base = data?.data ?? [];

    if (!clientSearch.trim()) {
      return base;
    }

    const term = clientSearch.trim().toLowerCase();
    return base.filter((product) => {
      const name = product.name?.toLowerCase() ?? "";
      const category = product.category?.toLowerCase() ?? "";
      return name.includes(term) || category.includes(term);
    });
  }, [clientSearch, data?.data]);

  const displayTotal = clientSearch
    ? filteredData.length
    : (data?.total ?? filteredData.length);

  const handleViewLocations = async (product: InventoryProduct) => {
    setSelectedProduct(product);
    setIsLocationsModalOpen(true);
    setIsLoadingLocations(true);

    try {
      const result = await getProductLocationsAction(product.id);
      if (result.success) {
        setLocations(result.data);
      } else {
        toast.error(result.error || "Error al obtener las ubicaciones");
        setLocations([]);
      }
    } catch (_error) {
      toast.error("Error al obtener las ubicaciones");
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const columns = getInventoryColumns({
    onViewLocations: handleViewLocations,
  });

  const handleCloseLocationsModal = () => {
    setIsLocationsModalOpen(false);
    setSelectedProduct(null);
    setLocations([]);
  };

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const normalizedPage = Math.max(1, nextPage);
      if (normalizedPage !== page) {
        setPage(normalizedPage);
        queueMicrotask(() => {
          void refetch();
        });
      }
    },
    [refetch, page],
  );

  const handlePageSizeChange = useCallback(
    (nextPageSize: number) => {
      setPageSize(nextPageSize);
      setPage(1);
      queueMicrotask(() => {
        void refetch();
      });
    },
    [refetch],
  );

  const handleMovementSuccess = () => {
    refetch();
  };

  const handleSearchChange = (value: string) => {
    setClientSearch(value);
    // El filtrado es local, no necesitamos cambiar la página ni hacer refetch
  };

  return (
    <>
      <EntityTableLayout
        config={{
          title: "Gestión de Inventario",
          description: "Administre su catálogo de productos y niveles de stock",
          searchPlaceholder: "Buscar por nombre o categoría...",
          filterDialogTitle: "Filtrar inventario",
          filterDialogDescription:
            "Selecciona uno o varios filtros y aplica para actualizar la tabla.",
          addAction: {
            label: "Registrar Movimiento",
            onClick: () => {
              setMovementModalInitialData(undefined);
              setMovementModalKey((prev) => prev + 1);
              setIsMovementModalOpen(true);
            },
          },
          exportAction: {
            label: "Exportar",
            onClick: () => toast.info("Función de exportar en desarrollo"),
          },
          columns,
          getRowId: (row: InventoryProduct) => row.id,
          showIndexColumn: false,
        }}
        data={filteredData}
        total={displayTotal}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading || isFetching}
        searchValue={clientSearch}
        onSearchChange={(value) => {
          handleSearchChange(value);
          // No llamar a onPageChange aquí porque el filtrado es local
          // EntityTableLayout lo llama automáticamente, pero lo ignoramos si ya estamos en página 1
        }}
        filters={filterDescriptors}
        filterState={filterState}
        onFilterStateChange={(next) => {
          setFilterState(next);
          setPage(1);
        }}
        pendingFilterState={pendingFilterState}
        onPendingFilterStateChange={setPendingFilterState}
        onApplyFilters={() => {
          applyFilters();
          setPage(1);
        }}
        onResetPendingFilters={resetPendingFilters}
        onClearFilters={() => {
          clearFilters();
          setPage(1);
        }}
        isFilterDialogOpen={isDialogOpen}
        setFilterDialogOpen={setDialogOpen}
        filterOptions={filterOptionsMap}
        isLoadingFilterOptions={isLoadingFilters}
      />

      <InventoryMovementModal
        key={movementModalKey}
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSuccess={handleMovementSuccess}
        initialData={movementModalInitialData}
      />

      <Dialog
        open={isLocationsModalOpen}
        onOpenChange={handleCloseLocationsModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ubicaciones del Producto</DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? `Distribución del producto "${selectedProduct.name}" por bodega`
                : "Distribución del producto por bodega"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingLocations ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-text-secondary">
                  Cargando ubicaciones...
                </div>
              </div>
            ) : locations.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-text-secondary">
                  No se encontraron ubicaciones para este producto
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bodega</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.bodega}>
                      <TableCell className="font-medium">
                        {location.bodega}
                      </TableCell>
                      <TableCell className="text-center">
                        {location.cantidad}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

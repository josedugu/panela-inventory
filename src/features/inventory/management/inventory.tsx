"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import type { ChangeEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { deleteProductAction } from "./actions/delete-product";
import { getInventoryFilterOptionsAction } from "./actions/get-filter-options";
import {
  type GetProductsSuccess,
  getProductsAction,
} from "./actions/get-products";

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
      base.status = (base.status ??
        Object.keys(STATUS_LABELS).map((value) => ({
          value,
          label: STATUS_LABELS[value as InventoryStatus] ?? value,
        }))) as { label: string; value: string }[];
    }

    base.status ??= Object.keys(STATUS_LABELS).map((value) => ({
      value,
      label: STATUS_LABELS[value as InventoryStatus] ?? value,
    }));

    base.category ??= [];
    base.brand ??= [];
    base.model ??= [];
    base.storage ??= [];
    base.color ??= [];
    base.imei ??= [];
    base.supplier ??= [];

    return base;
  }, [filterOptions, normalizedOptions]);

  const isLoadingFilters = isLoadingFilterOptions && !filterOptions;

  const filteredData = useMemo(() => {
    const base = data?.data ?? [];
    const sorted = base
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    if (!clientSearch.trim()) {
      return sorted;
    }

    const term = clientSearch.trim().toLowerCase();
    return sorted.filter((product) => {
      const brand = product.brand?.toLowerCase() ?? "";
      const model = product.model?.toLowerCase() ?? "";
      const imei = product.imei?.toLowerCase() ?? "";
      const name = product.name?.toLowerCase() ?? "";
      const category = product.category?.toLowerCase() ?? "";
      return (
        brand.includes(term) ||
        model.includes(term) ||
        imei.includes(term) ||
        name.includes(term) ||
        category.includes(term)
      );
    });
  }, [clientSearch, data?.data]);

  const displayTotal = clientSearch
    ? filteredData.length
    : (data?.total ?? filteredData.length);

  const columns: ColumnDef<InventoryProduct>[] = [
    {
      accessorKey: "brand",
      header: "Marca",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.brand}</div>
      ),
      size: 140,
    },
    {
      accessorKey: "model",
      header: "Modelo",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.model}</div>
      ),
      size: 140,
    },
    {
      accessorKey: "storage",
      header: "Almacenamiento",
      cell: ({ row }) => row.original.storage || "-",
      size: 140,
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => row.original.color || "-",
      size: 120,
    },
    {
      accessorKey: "imei",
      header: "IMEI",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.imei}</div>
      ),
      size: 180,
    },
    {
      accessorKey: "category",
      header: "Categoría",
      size: 160,
    },
    {
      accessorKey: "cost",
      header: "Costo",
      cell: ({ row }) => (
        <div className="text-right">${row.original.cost.toFixed(2)}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "quantity",
      header: "Cant",
      cell: ({ row }) => (
        <div className="text-right">{row.original.quantity}</div>
      ),
      size: 80,
    },
    {
      accessorKey: "supplier",
      header: "Proveedor",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.supplier}</div>
      ),
      size: 180,
    },
  ];

  const handleDelete = async (product: InventoryProduct) => {
    // Usar el ID del detalle, no del producto
    const result = await deleteProductAction(product.id);
    if (result.success) {
      toast.success("Producto eliminado exitosamente");
      refetch();
    } else {
      toast.error(result.error || "Error al eliminar producto");
    }
  };

  const handleDuplicate = (product: InventoryProduct) => {
    const latestMovement = product.latestMovement;
    const costValue = latestMovement?.cost ?? product.cost;
    const quantityValue =
      latestMovement && typeof latestMovement.quantity === "number"
        ? latestMovement.quantity.toString()
        : "";
    const imeiList =
      latestMovement && latestMovement.imeis.length > 0
        ? latestMovement.imeis.join(", ")
        : product.imei !== "-" && product.imei !== "" && product.imei !== "N/A"
          ? product.imei
          : "";

    setMovementModalInitialData({
      product: product.productId,
      movementType: latestMovement?.typeId ?? "",
      cost: Number.isFinite(costValue) ? costValue.toFixed(2) : "",
      quantity: quantityValue,
      imeis: imeiList,
    });
    setMovementModalKey((prev) => prev + 1);
    setIsMovementModalOpen(true);
  };

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const normalizedPage = Math.max(1, nextPage);
      setPage(normalizedPage);
      queueMicrotask(() => {
        void refetch();
      });
    },
    [refetch],
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
    setPage(1);
  };

  return (
    <>
      <EntityTableLayout
        config={{
          title: "Gestión de Inventario",
          description: "Administre su catálogo de productos y niveles de stock",
          searchPlaceholder: "Buscar por marca, modelo o IMEI...",
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
          onDelete: handleDelete,
          onDuplicate: handleDuplicate,
          getRowId: (row: InventoryProduct) => row.id,
        }}
        data={filteredData}
        total={displayTotal}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading || isFetching}
        searchValue={clientSearch}
        onSearchChange={handleSearchChange}
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
    </>
  );
}

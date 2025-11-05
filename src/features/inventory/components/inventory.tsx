"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import { useEntityFilters } from "@/features/entity-table/hooks/use-entity-filters";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import { deleteProductAction } from "../actions/delete-product";
import { getInventoryFilterOptionsAction } from "../actions/get-filter-options";
import {
  type GetProductsSuccess,
  getProductsAction,
  type InventoryProductDTO,
} from "../actions/get-products";
import { AddProductModal } from "./add-product-modal";
import { StockBadge, type StockStatus } from "./stock-badge";

type InventoryProduct = InventoryProductDTO;

type InventoryStatus = InventoryProduct["status"];

const STATUS_LABELS: Record<InventoryStatus, string> = {
  "in-stock": "En stock",
  "low-stock": "Stock bajo",
  "out-of-stock": "Sin stock",
};

export function Inventory() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
        key: "supplier",
        label: "Proveedor",
        type: "input-search",
      },
      {
        key: "status",
        label: "Estado",
        type: "input-search",
      },
    ],
    [],
  );

  const {
    search,
    setSearch,
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
      queryKey: ["products", page, pageSize, search, filtersKey],
      queryFn: async () => {
        const result = await getProductsAction({
          page,
          pageSize,
          search,
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
    base.supplier ??= [];

    return base;
  }, [filterOptions, normalizedOptions]);

  const isLoadingFilters = isLoadingFilterOptions && !filterOptions;

  const columns: ColumnDef<InventoryProduct>[] = [
    {
      accessorKey: "name",
      header: "Nombre Producto",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      size: 150,
    },
    {
      accessorKey: "brand",
      header: "Marca",
      size: 100,
    },
    {
      accessorKey: "model",
      header: "Modelo",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.model}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "imei",
      header: "IMEI",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.sku}</div>
      ),
      size: 140,
    },
    {
      accessorKey: "category",
      header: "Categoría",
      size: 100,
    },
    {
      accessorKey: "storage",
      header: "Almacenamiento",
      cell: ({ row }) => row.original.storage || "-",
      size: 80,
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => row.original.color || "-",
      size: 100,
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => (
        <div className="text-right">${row.original.price.toFixed(2)}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "cost",
      header: "Costo",
      cell: ({ row }) => (
        <div className="text-right">${row.original.cost.toFixed(2)}</div>
      ),
      size: 100,
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
      accessorKey: "minStock",
      header: "Stock Mín",
      cell: ({ row }) => (
        <div className="text-right">{row.original.minStock}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "supplier",
      header: "Proveedor",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.supplier}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const product = row.original;
        const status: StockStatus = product.status;
        return <StockBadge status={status} quantity={product.quantity} />;
      },
      size: 100,
    },
    {
      accessorKey: "lastUpdated",
      header: "Última Actualización",
      cell: ({ row }) => {
        const date = new Date(row.original.lastUpdated);
        return (
          <div className="text-sm text-text-secondary">
            {new Intl.DateTimeFormat("es-CO", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(date)}
          </div>
        );
      },
      size: 110,
    },
  ];

  const handleEdit = (product: InventoryProduct) => {
    console.log("Edit product:", product);
    toast.info("Función de edición en desarrollo");
  };

  const handleDelete = async (product: InventoryProduct) => {
    const result = await deleteProductAction(product.id);
    if (result.success) {
      toast.success("Producto eliminado exitosamente");
      refetch();
    } else {
      toast.error(result.error || "Error al eliminar producto");
    }
  };

  const handleDuplicate = (product: InventoryProduct) => {
    console.log("Duplicate product:", product);
    toast.info("Función de duplicación en desarrollo");
  };

  const handleAddProduct = () => {
    toast.success("Producto agregado exitosamente");
    refetch();
    setIsAddModalOpen(false);
  };

  return (
    <>
      <EntityTableLayout
        config={{
          title: "Gestión de Inventario",
          description: "Administre su catálogo de productos y niveles de stock",
          searchPlaceholder: "Buscar por nombre, SKU o marca...",
          filterDialogTitle: "Filtrar inventario",
          filterDialogDescription:
            "Selecciona uno o varios filtros y aplica para actualizar la tabla.",
          addAction: {
            label: "Agregar Producto",
            onClick: () => setIsAddModalOpen(true),
          },
          exportAction: {
            label: "Exportar",
            onClick: () => toast.info("Función de exportar en desarrollo"),
          },
          columns,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onDuplicate: handleDuplicate,
          getRowId: (row: InventoryProduct) => row.id,
        }}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
        isLoading={isLoading || isFetching}
        searchValue={search}
        onSearchChange={setSearch}
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

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
      />
    </>
  );
}

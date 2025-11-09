"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import { useEntityFilters } from "@/features/entity-table/hooks/use-entity-filters";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import type { GetSalesSuccess, SaleDTO } from "../actions/get-sales";
import { getSalesAction } from "../actions/get-sales";
import { CreateSaleModal } from "./create-sale-modal";
import { ViewSaleModal } from "./view-sale-modal";

type Sale = SaleDTO;

export function Sales() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filterDescriptors = useMemo<EntityFilterDescriptor[]>(
    () => [
      {
        key: "seller",
        label: "Vendedor",
        type: "input-search",
      },
      {
        key: "client",
        label: "Cliente",
        type: "input-search",
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

  const { data, isLoading, isFetching, refetch } = useQuery<GetSalesSuccess>({
    queryKey: ["sales", page, pageSize, filtersKey, search],
    queryFn: async () => {
      const result = await getSalesAction({
        page,
        pageSize,
        search: search.trim() || undefined,
        filters: {
          seller: filterState.seller,
          client: filterState.client,
        },
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    },
    placeholderData: (previous) => previous,
    refetchInterval: 30000,
  });

  const sales = data?.data ?? [];
  const total = data?.total ?? 0;
  const filterOptions = data?.filterOptions;

  const filterOptionsMap = useMemo(() => {
    const base = { ...normalizedOptions } as Record<
      string,
      { label: string; value: string }[]
    >;

    if (filterOptions) {
      base.seller = filterOptions.sellers.map((value) => ({
        value,
        label: value,
      }));
      base.client = filterOptions.clients.map((value) => ({
        value,
        label: value,
      }));
    }

    base.seller ??= [];
    base.client ??= [];

    return base;
  }, [filterOptions, normalizedOptions]);

  const columns = useMemo<ColumnDef<Sale>[]>(
    () => [
      {
        accessorKey: "consecutivo",
        header: "Consecutivo",
        size: 140,
      },
      {
        accessorKey: "totalFormatted",
        header: "Total",
        cell: ({ row }) => (
          <div className="text-right font-medium text-success">
            {row.original.totalFormatted}
          </div>
        ),
        size: 160,
      },
      {
        accessorKey: "createdAtLabel",
        header: "Fecha",
        cell: ({ row }) => (
          <div className="text-sm text-text-secondary">
            {row.original.createdAtLabel}
          </div>
        ),
        size: 200,
      },
      {
        accessorKey: "seller",
        header: "Vendedor",
        cell: ({ row }) => row.original.seller ?? "-",
        size: 200,
      },
      {
        accessorKey: "client",
        header: "Cliente",
        cell: ({ row }) => row.original.client ?? "-",
        size: 200,
      },
    ],
    [],
  );

  return (
    <>
      <EntityTableLayout
        config={{
          title: "Ventas",
          description: "Historial de ventas procesadas",
          searchPlaceholder: "Buscar por consecutivo, cliente o vendedor...",
          filterDialogTitle: "Filtrar ventas",
          filterDialogDescription:
            "Selecciona filtros y aplica para actualizar la tabla.",
          addAction: {
            label: "Crear venta",
            onClick: () => setIsCreateModalOpen(true),
          },
          exportAction: {
            label: "Exportar",
            onClick: () => toast.info("Función de exportar en desarrollo"),
          },
          columns,
          getRowId: (row: Sale) => row.id,
          onView: (row: Sale) => {
            setSelectedSaleId(row.id);
            setIsViewModalOpen(true);
          },
          onEdit: (row: Sale) => {
            setEditingSaleId(row.id);
            setIsEditModalOpen(true);
          },
        }}
        data={sales}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(next) => {
          const normalized = Math.max(1, next);
          if (normalized !== page) {
            setPage(normalized);
            queueMicrotask(() => {
              void refetch();
            });
          }
        }}
        onPageSizeChange={(nextSize) => {
          setPageSize(nextSize);
          setPage(1);
          queueMicrotask(() => {
            void refetch();
          });
        }}
        isLoading={isLoading || isFetching}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          // El search está en el queryKey, React Query hará refetch automáticamente
          // No necesitamos cambiar la página manualmente aquí
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
        isLoadingFilterOptions={isLoading && !filterOptions}
      />

      <CreateSaleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <CreateSaleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSaleId(null);
        }}
        saleId={editingSaleId}
      />

      <ViewSaleModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedSaleId(null);
        }}
        saleId={selectedSaleId}
      />
    </>
  );
}

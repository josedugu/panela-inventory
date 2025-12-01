"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
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
    queryKey: ["sales", filtersKey],
    queryFn: async () => {
      const result = await getSalesAction({
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
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 30, // 30 minutos - cacheo para navegación rápida
    refetchInterval: 30000,
  });

  const allSales = data?.data ?? [];
  const filterOptions = data?.filterOptions;

  // Filtrar en el frontend con la información ya obtenida
  const filteredSales = useMemo(() => {
    if (!search.trim()) {
      return allSales;
    }

    const searchTerm = search.toLowerCase();
    return allSales.filter((sale) => {
      const searchableFields = [
        sale.consecutivo.toString(),
        sale.seller,
        sale.client,
      ]
        .filter(Boolean)
        .map((value) => value?.toLowerCase() ?? "");

      return searchableFields.some((value) => value.includes(searchTerm));
    });
  }, [allSales, search]);

  // Paginar los resultados filtrados
  const sales = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return filteredSales.slice(offset, offset + pageSize);
  }, [filteredSales, page, pageSize]);

  const total = filteredSales.length;

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
            onClick: () => router.push("/dashboard/sales/new"),
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
          }
        }}
        onPageSizeChange={(nextSize) => {
          setPageSize(nextSize);
          setPage(1);
        }}
        isLoading={isLoading || isFetching}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1); // Resetear a la primera página cuando se busca
        }}
        filters={filterDescriptors}
        filterState={filterState}
        onFilterStateChange={(next) => {
          setFilterState(next);
          setPage(1);
          queueMicrotask(() => {
            void refetch();
          });
        }}
        pendingFilterState={pendingFilterState}
        onPendingFilterStateChange={setPendingFilterState}
        onApplyFilters={() => {
          applyFilters();
          setPage(1);
          queueMicrotask(() => {
            void refetch();
          });
        }}
        onResetPendingFilters={resetPendingFilters}
        onClearFilters={() => {
          clearFilters();
          setPage(1);
          queueMicrotask(() => {
            void refetch();
          });
        }}
        isFilterDialogOpen={isDialogOpen}
        setFilterDialogOpen={setDialogOpen}
        filterOptions={filterOptionsMap}
        isLoadingFilterOptions={isLoading && !filterOptions}
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

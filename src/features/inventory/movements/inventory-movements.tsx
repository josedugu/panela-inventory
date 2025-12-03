"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import { useEntityFilters } from "@/features/entity-table/hooks/use-entity-filters";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  type InventoryMovementInitialData,
  InventoryMovementModal,
} from "@/features/inventory/general-ui/add-product-modal";
import { NumericFilterField } from "../general-ui/numericFilterField";
import {
  type GetInventoryMovementsSuccess,
  getInventoryMovementsAction,
  type InventoryMovementDTO,
  type MovementOperation,
} from "./actions/get-inventory-movements";
import { getInventoryMovementColumns } from "./columns";

const OPERATION_LABELS: Record<MovementOperation, string> = {
  ingreso: "Ingreso",
  salida: "Salida",
};

type InventoryMovement = InventoryMovementDTO;

export function InventoryMovements() {
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementModalInitialData, setMovementModalInitialData] =
    useState<InventoryMovementInitialData>();
  const [movementModalReadOnly, setMovementModalReadOnly] = useState(false);
  const [movementModalKey, setMovementModalKey] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");

  const filterDescriptors = useMemo<EntityFilterDescriptor[]>(
    () => [
      {
        key: "type",
        label: "Tipo de movimiento",
        type: "input-search",
      },
      {
        key: "product",
        label: "Producto",
        type: "input-search",
      },
      {
        key: "operation",
        label: "Operación",
        type: "input-search",
        options: Object.entries(OPERATION_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      {
        key: "user",
        label: "Creado por",
        type: "input-search",
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
      {
        key: "unitCost",
        label: "Costo unitario",
        type: "custom",
        render: ({ value, onChange }) => (
          <NumericFilterField
            label="Costo unitario"
            value={value}
            onChange={onChange}
            step="0.01"
            placeholder="0.00"
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

  const { data, isLoading, isFetching, refetch } =
    useQuery<GetInventoryMovementsSuccess>({
      queryKey: [
        "inventory-movements",
        page,
        pageSize,
        filtersKey,
        searchValue,
      ],
      queryFn: async () => {
        const result = await getInventoryMovementsAction({
          page,
          pageSize,
          search: searchValue.trim() || undefined,
          filters: {
            type: filterState.type,
            product: filterState.product,
            operation: filterState.operation as MovementOperation | undefined,
            user: filterState.user,
            quantity: filterState.quantity,
            unitCost: filterState.unitCost,
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

  const movements = data?.data ?? [];
  const total = data?.total ?? 0;
  const filterOptions = data?.filterOptions;

  const filterOptionsMap = useMemo(() => {
    const base = { ...normalizedOptions } as Record<
      string,
      { label: string; value: string }[]
    >;

    if (filterOptions) {
      base.type = filterOptions.movementTypes.map((value) => ({
        value,
        label: value,
      }));
      base.product = filterOptions.products.map((value) => ({
        value,
        label: value,
      }));
      base.operation = filterOptions.operations.map((value) => ({
        value,
        label: OPERATION_LABELS[value],
      }));
      base.user = filterOptions.users.map((value) => ({
        value,
        label: value,
      }));
    }

    base.operation ??= Object.entries(OPERATION_LABELS).map(
      ([value, label]) => ({
        value,
        label,
      }),
    );

    base.type ??= [];
    base.product ??= [];
    base.user ??= [];

    return base;
  }, [filterOptions, normalizedOptions]);

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
    void refetch();
  };

  const handleView = useCallback((movement: InventoryMovement) => {
    setMovementModalInitialData({
      product: movement.productId ?? "",
      movementType: movement.typeId ?? "",
      cost: movement.unitCost.toFixed(2),
      quantity: movement.quantity.toString(),
      imeis: movement.imeis.join(", "),
      comentario: movement.comentario,
      bodegaNombre: movement.bodegaNombre,
      proveedorNombre: movement.proveedorNombre,
      ventaConsecutivo: movement.ventaConsecutivo,
      clienteNombre: movement.clienteNombre,
      createdBy: movement.createdBy,
    });
    setMovementModalReadOnly(true);
    setMovementModalKey((prev) => prev + 1);
    setIsMovementModalOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      getInventoryMovementColumns({
        onView: handleView,
      }),
    [handleView],
  );

  return (
    <>
      <EntityTableLayout
        config={{
          title: "Movimientos de Inventario",
          description:
            "Consulta el historial de movimientos, cantidades y costos asociados a tu inventario.",
          searchPlaceholder: "Buscar por tipo, producto o IMEI...",
          filterDialogTitle: "Filtrar movimientos",
          filterDialogDescription:
            "Selecciona uno o varios filtros y aplica para actualizar la tabla.",
          addAction: {
            label: "Registrar Movimiento",
            onClick: () => {
              setMovementModalInitialData(undefined);
              setMovementModalKey((prev) => prev + 1);
              setMovementModalReadOnly(false);
              setIsMovementModalOpen(true);
            },
          },
          exportAction: {
            label: "Exportar",
            onClick: () => toast.info("Función de exportar en desarrollo"),
          },
          columns,
          getRowId: (row: InventoryMovement) => row.id,
        }}
        data={movements}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading || isFetching}
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          // El searchValue está en el queryKey, React Query hará refetch automáticamente
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

      <InventoryMovementModal
        key={movementModalKey}
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSuccess={handleMovementSuccess}
        initialData={movementModalInitialData}
        isReadOnly={movementModalReadOnly}
      />
    </>
  );
}

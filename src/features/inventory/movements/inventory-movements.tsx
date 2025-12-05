"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import {
  type InventoryMovementInitialData,
  InventoryMovementModal,
} from "@/features/inventory/general-ui/add-product-modal";
import {
  type GetInventoryMovementsSuccess,
  getInventoryMovementsAction,
  type InventoryMovementDTO,
} from "./actions/get-inventory-movements";
import { getInventoryMovementColumns } from "./columns";

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

  const { data, isLoading, isFetching, refetch } =
    useQuery<GetInventoryMovementsSuccess>({
      queryKey: ["inventory-movements", page, pageSize, searchValue],
      queryFn: async () => {
        const result = await getInventoryMovementsAction({
          page,
          pageSize,
          search: searchValue.trim() || undefined,
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
      pvp: movement.pvp?.toFixed(2),
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
          searchPlaceholder: "Buscar por consecutivo, producto o IMEI...",
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
          setPage(1);
        }}
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

"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ExportDropdown } from "@/components/ui/export-dropdown";
import { useExportData } from "@/hooks/use-export-data";
import { getInventoryControlDataAction } from "./actions";
import { ImeiModal } from "./components/imei-modal";
import { InventoryControlStatsCards } from "./components/inventory-control-stats-cards";
import { InventoryControlTable } from "./components/inventory-control-table";
import type {
  ExportInventoryItem,
  ImeiItem,
  InventoryControlTableRow,
} from "./types";

export function InventoryControl() {
  const [selectedImeiItems, setSelectedImeiItems] = useState<ImeiItem[]>([]);
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState("");

  // Hook para exportación
  const { exportData } = useExportData<ExportInventoryItem>();

  // Query para obtener datos principales
  const {
    data: inventoryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inventory-control-data"],
    queryFn: async () => {
      const result = await getInventoryControlDataAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Transformar datos para la tabla
  const tableData: InventoryControlTableRow[] = useMemo(() => {
    if (!inventoryData) return [];

    return inventoryData.products.map((product) => {
      const cantidadesPorBodega: Record<string, number> = {};

      // Inicializar todas las bodegas con 0
      for (const bodega of inventoryData.bodegas) {
        cantidadesPorBodega[bodega.id] = 0;
      }

      // Llenar con cantidades reales
      for (const bodega of product.bodegas) {
        cantidadesPorBodega[bodega.id] = bodega.cantidad;
      }

      return {
        producto: product,
        cantidadesPorBodega,
        bodegas: inventoryData.bodegas,
      };
    });
  }, [inventoryData]);

  // Función para manejar clic en celda de cantidad
  const handleQuantityClick = async (
    productId: string,
    bodegaId: string,
    productName: string,
  ) => {
    try {
      const { getImeiListAction } = await import("./actions");
      const result = await getImeiListAction(productId, bodegaId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSelectedImeiItems(result.data);
      setSelectedProductName(productName);
      setIsImeiModalOpen(true);
    } catch (_error) {
      toast.error("Error al obtener los IMEIs");
    }
  };

  // Función para manejar exportación
  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      const { exportInventoryControlAction } = await import("./actions");
      const result = await exportInventoryControlAction();

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.data.length === 0) {
        toast.warning("No hay datos para exportar");
        return;
      }

      const columns: ColumnDef<ExportInventoryItem, unknown>[] = [
        {
          accessorKey: "nombre",
          header: "Producto",
        },
        {
          accessorKey: "imei",
          header: "IMEI",
        },
        {
          accessorKey: "bodega",
          header: "Bodega",
        },
      ];

      const filename = `control-inventario-${new Date().toISOString().split("T")[0]}`;

      exportData(format, {
        data: result.data,
        columns,
        filename,
        title: "Control de Inventario Físico",
      });
    } catch (_error) {
      toast.error("Error al exportar los datos");
    }
  };

  // Manejo de errores
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Control</h1>
          <p className="text-muted-foreground">
            Gestión de controles de inventario físico
          </p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-destructive">
            Error al cargar los datos: {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Control</h1>
          <p className="text-text-secondary mt-1">
            Gestión de controles de inventario físico
          </p>
        </div>

        {/* Botón de exportación */}
        <ExportDropdown
          onExport={handleExport}
          disabled={isLoading || !inventoryData?.products.length}
        />
      </div>

      {/* Cards de estadísticas */}
      <InventoryControlStatsCards
        stats={inventoryData?.stats}
        isLoading={isLoading}
      />

      {/* Tabla */}
      <InventoryControlTable
        data={tableData}
        bodegas={inventoryData?.bodegas || []}
        isLoading={isLoading}
        onQuantityClick={handleQuantityClick}
      />

      {/* Modal de IMEIs */}
      <ImeiModal
        isOpen={isImeiModalOpen}
        onClose={() => setIsImeiModalOpen(false)}
        imeiItems={selectedImeiItems}
        productName={selectedProductName}
      />
    </div>
  );
}

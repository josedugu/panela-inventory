"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  PackageSearch,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { InventoryProduct } from "@/features/inventory/functions/types";
import type { ProductLocationSummary } from "@/features/inventory/management/actions/get-product-locations";
import { getProductLocationsAction } from "@/features/inventory/management/actions/get-product-locations";
import { getInventoryColumns } from "@/features/inventory/management/columns";
import { searchInventoryProductsAction } from "./actions/search-inventory-products";
import { LocationList } from "./location-list";
import { ProductTimelineModal } from "./product-timeline-modal";

export function InventorySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);

  // Modales
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  // Estado para timeline
  const [timelineProductDetailId, setTimelineProductDetailId] = useState<
    string | null
  >(null);
  const [timelineInitialData, setTimelineInitialData] = useState<
    { imei: string; productName: string } | undefined
  >(undefined);

  const [locations, setLocations] = useState<ProductLocationSummary[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const {
    data: searchResult,
    isLoading: isFreeSearchLoading,
    isFetching: isFreeSearchFetching,
    error: freeSearchError,
  } = useQuery({
    queryKey: ["inventory", "search", "free", submittedTerm, page, pageSize],
    enabled: Boolean(submittedTerm),
    queryFn: async () => {
      const result = await searchInventoryProductsAction(
        submittedTerm,
        page,
        pageSize,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    retry: false,
    staleTime: 1000 * 30,
  });

  const freeSearchResults = searchResult?.data ?? [];
  const totalResults = searchResult?.total ?? 0;

  // Detectar si hubo un match exacto por IMEI
  const matchedImeiInfo = searchResult?.matchedImeiInfo;
  const isImeiMatch = searchResult?.matchType === "imei" && !!matchedImeiInfo;

  useEffect(() => {
    if (freeSearchError) {
      const message =
        freeSearchError instanceof Error
          ? freeSearchError.message
          : "No se pudo cargar el producto";
      toast.error(message);
    }
  }, [freeSearchError]);

  const handleViewLocations = useCallback(
    async (productRow: InventoryProduct) => {
      setSelectedProduct(productRow);
      setIsLocationsModalOpen(true);
      setIsLoadingLocations(true);

      try {
        const result = await getProductLocationsAction(productRow.id);

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
    },
    [],
  );

  // Función para ver el timeline desde la tabla principal (botón de acción)
  const handleViewTimeline = useCallback((productRow: InventoryProduct) => {
    if (productRow.foundByImei && productRow.matchedProductDetailId) {
      setTimelineProductDetailId(productRow.matchedProductDetailId);
      setTimelineInitialData({
        imei: productRow.matchedImei || "Desconocido",
        productName: productRow.name,
      });
      setIsTimelineModalOpen(true);
    }
  }, []);

  const columns = useMemo(
    () =>
      getInventoryColumns({
        onViewLocations: handleViewLocations,
        onViewTimeline: handleViewTimeline,
      }),
    [handleViewLocations, handleViewTimeline],
  );

  const tableData = useMemo(
    () => (submittedTerm ? freeSearchResults : []),
    [freeSearchResults, submittedTerm],
  );

  const clearSelection = () => {
    setSelectedProduct(null);
    setLocations([]);
    setSearchTerm("");
    setSubmittedTerm("");
    setPage(1);
  };

  const handleSearch = useCallback(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      toast.error("Ingresa un término de búsqueda para continuar");
      return;
    }

    setSubmittedTerm(trimmed);
    setSelectedProduct(null);
    setLocations([]);
    setPage(1); // Resetear a la primera página en cada búsqueda nueva
  }, [searchTerm]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Resetear a la primera página al cambiar el tamaño
  }, []);

  const handleOpenTimeline = () => {
    if (matchedImeiInfo) {
      setTimelineProductDetailId(matchedImeiInfo.productDetailId);
      setTimelineInitialData({
        imei: matchedImeiInfo.imei,
        productName: matchedImeiInfo.productName,
      });
      setIsTimelineModalOpen(true);
    }
  };

  // Abrir timeline desde el modal de ubicaciones
  const handleOpenTimelineFromItem = (
    productDetailId: string,
    imei: string,
  ) => {
    // Cerrar modal de ubicaciones temporalmente si se desea, o mantenerlo abajo
    // Preferiblemente abrir el timeline encima
    setTimelineProductDetailId(productDetailId);
    setTimelineInitialData({
      imei: imei || "Sin IMEI",
      productName: selectedProduct?.name || "Producto",
    });
    setIsTimelineModalOpen(true);
  };

  const isTableLoading = isFreeSearchLoading || isFreeSearchFetching;

  const shouldShowTable = tableData.length > 0 || isTableLoading;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <PackageSearch className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">Búsqueda de inventario</h1>
        </div>
        <p className="text-text-secondary">
          Escribe nombre, modelo o IMEI y presiona Enter o &quot;Buscar&quot;
          para ver todas las coincidencias en la grilla.
        </p>
      </div>

      {/* IMEI Match Card - aparece SOLO si hay match exacto de IMEI */}
      {isImeiMatch && matchedImeiInfo && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20 p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/50">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                    ¡Producto encontrado por IMEI!
                  </h3>
                  <p className="text-emerald-700 dark:text-emerald-300 mt-1">
                    {matchedImeiInfo.productName}{" "}
                    <span className="mx-1">•</span>
                    <span className="font-mono bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded text-sm">
                      {matchedImeiInfo.imei}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    <MapPin className="h-4 w-4" />
                    Ubicación actual:{" "}
                    {matchedImeiInfo.bodegaNombre || "Sin asignar"}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleOpenTimeline}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shrink-0 self-start sm:self-center"
              >
                Ver Historial y Movimientos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              placeholder="Buscar por nombre, modelo o IMEI"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              className="md:flex-1"
            />
            <Button type="button" onClick={handleSearch}>
              Buscar
            </Button>
            {submittedTerm || searchTerm ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                aria-label="Limpiar selección"
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>

          {shouldShowTable ? (
            <DataGrid
              data={tableData}
              columns={columns}
              isLoading={isTableLoading}
              showIndexColumn={false}
              getRowId={(row) => row.id}
              enableContextMenu={false} // Deshabilitar menú contextual nativo de DataGrid
              pagination={
                submittedTerm
                  ? {
                      page,
                      pageSize,
                      total: totalResults,
                      onPageChange: handlePageChange,
                      onPageSizeChange: handlePageSizeChange,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-border bg-surface-1/40 text-text-secondary">
              Escribe un término y presiona Enter o &quot;Buscar&quot; para ver
              todas las coincidencias.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Ubicaciones (Mejorado) */}
      <Dialog
        open={isLocationsModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsLocationsModalOpen(false);
            setSelectedProduct(null);
            setLocations([]);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ubicaciones del Producto</DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? `Distribución del producto "${selectedProduct.name}" por bodega e items individuales`
                : "Distribución del producto por bodega"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
            <LocationList
              locations={locations}
              productId={selectedProduct?.id || ""}
              onViewHistory={(item) =>
                handleOpenTimelineFromItem(item.id, item.imei || "")
              }
              isLoading={isLoadingLocations}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Timeline */}
      <ProductTimelineModal
        isOpen={isTimelineModalOpen}
        onClose={() => setIsTimelineModalOpen(false)}
        productDetailId={timelineProductDetailId}
        initialData={timelineInitialData}
      />
    </div>
  );
}

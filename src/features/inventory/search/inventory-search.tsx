"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageSearch, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryProduct } from "@/features/inventory/functions/types";
import type { ProductLocation } from "@/features/inventory/management/actions/get-product-locations";
import { getProductLocationsAction } from "@/features/inventory/management/actions/get-product-locations";
import { getInventoryColumns } from "@/features/inventory/management/columns";
import { searchInventoryProductsAction } from "./actions/search-inventory-products";

export function InventorySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [locations, setLocations] = useState<ProductLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const {
    data: freeSearchResults = [],
    isLoading: isFreeSearchLoading,
    isFetching: isFreeSearchFetching,
    error: freeSearchError,
  } = useQuery({
    queryKey: ["inventory", "search", "free", submittedTerm],
    enabled: Boolean(submittedTerm),
    queryFn: async () => {
      const result = await searchInventoryProductsAction(submittedTerm);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    retry: false,
    staleTime: 1000 * 30,
  });

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

  const columns = useMemo(
    () =>
      getInventoryColumns({
        onViewLocations: handleViewLocations,
      }),
    [handleViewLocations],
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
  }, [searchTerm]);

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
          Escribe para encontrar un producto y consulta sus ubicaciones en un
          vistazo.
        </p>
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Buscar producto</CardTitle>
            <p className="text-sm text-text-secondary">
              Escribe nombre, modelo o IMEI y presiona Enter o
              &quot;Buscar&quot; para ver todas las coincidencias en la grilla.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
            />
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-border bg-surface-1/40 text-text-secondary">
              Escribe un término y presiona Enter o &quot;Buscar&quot; para ver
              todas las coincidencias.
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}

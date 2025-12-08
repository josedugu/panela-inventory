"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { getAccessibleCostCentersAction } from "../actions/get-accessible-cost-centers";
import { getCajaDataAction } from "../actions/get-caja-data";
import { CajaAdminView } from "./caja-admin-view";
import { CajaAsesorView } from "./caja-asesor-view";

export function CajaScreen() {
  const { isAdmin } = useUserRole();

  // Obtener fecha actual en formato YYYY-MM-DD para los inputs
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Estados para los inputs (no disparan fetch)
  const [inputFechaDesde, setInputFechaDesde] = useState<string>(
    getTodayString(),
  );
  const [inputFechaHasta, setInputFechaHasta] = useState<string>(
    getTodayString(),
  );

  const [fechaError, setFechaError] = useState<string | null>(null);

  // Estados para la query (solo se actualizan al buscar)
  const [fechaDesde, setFechaDesde] = useState<string>(getTodayString());
  const [fechaHasta, setFechaHasta] = useState<string>(getTodayString());
  const [centroCostoId, setCentroCostoId] = useState<string>("");

  // Estado para el selector de centro de costo (no dispara fetch hasta buscar)
  const [selectedCentroCosto, setSelectedCentroCosto] = useState<string>("");

  // Obtener centros de costos accesibles (solo para admin)
  const {
    data: costCenters,
    isLoading: isLoadingCostCenters,
    error: costCentersError,
  } = useQuery({
    queryKey: ["accessible-cost-centers"],
    queryFn: async () => {
      const result = await getAccessibleCostCentersAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: isAdmin, // Solo cargar para admin
  });

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["caja-data", fechaDesde, fechaHasta, centroCostoId],
    queryFn: async () => {
      const result = await getCajaDataAction(
        fechaDesde,
        fechaHasta,
        centroCostoId || undefined,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const handleSearch = () => {
    // Validar que las fechas sean válidas
    if (!inputFechaDesde || !inputFechaHasta) {
      return;
    }

    // Validar que fechaDesde no sea mayor que fechaHasta
    if (inputFechaDesde > inputFechaHasta) {
      setFechaError("La fecha inicial no puede ser mayor que la final.");
      return;
    }

    setFechaError(null);
    setFechaDesde(inputFechaDesde);
    setFechaHasta(inputFechaHasta);

    // Actualizar el centro de costo seleccionado para la query
    setCentroCostoId(selectedCentroCosto);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-error">
              {error instanceof Error
                ? error.message
                : "Error al cargar los datos de caja"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header con selector de fecha */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Caja</h1>
          <p className="text-sm text-text-secondary mt-1">
            Resumen de ventas y pagos recibidos
          </p>
        </div>

        {/* Inputs de fecha y filtro de centro de costos */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="fecha-desde">Desde</Label>
            <Input
              id="fecha-desde"
              type="date"
              value={inputFechaDesde}
              onChange={(e) => setInputFechaDesde(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="fecha-hasta">Hasta</Label>
            <Input
              id="fecha-hasta"
              type="date"
              value={inputFechaHasta}
              onChange={(e) => setInputFechaHasta(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mt-1"
              min={inputFechaDesde}
            />
          </div>
          {fechaError ? (
            <p className="text-sm text-error sm:self-end sm:pb-2">
              {fechaError}
            </p>
          ) : null}
          {isAdmin && (
            <div className="flex-1">
              <Label htmlFor="centro-costo">Centro de Costos</Label>
              <Select
                value={selectedCentroCosto}
                onValueChange={setSelectedCentroCosto}
                disabled={isLoadingCostCenters}
              >
                {isLoadingCostCenters ? (
                  <SelectTrigger className="mt-1" disabled>
                    <div className="flex-1 flex items-center gap-2">
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </SelectTrigger>
                ) : (
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        selectedCentroCosto
                          ? costCenters?.find(
                              (center) => center.id === selectedCentroCosto,
                            )?.nombre || "Centro no encontrado"
                          : "Todos los centros"
                      }
                    />
                  </SelectTrigger>
                )}
                <SelectContent>
                  {isLoadingCostCenters ? (
                    <SelectItem value="__loading" disabled>
                      Cargando centros...
                    </SelectItem>
                  ) : costCentersError ? (
                    <SelectItem value="__error" disabled>
                      Error al cargar centros
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="">Todos los centros</SelectItem>
                      {costCenters?.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.nombre}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {costCentersError ? (
                <p className="text-sm text-error mt-1">
                  {costCentersError instanceof Error
                    ? costCentersError.message
                    : "No se pudieron cargar los centros de costo."}
                </p>
              ) : null}
            </div>
          )}
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              className="w-full sm:w-auto mt-1"
              disabled={isLoading || isFetching}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Vista según rol */}
      {isAdmin ? (
        <CajaAdminView
          isLoading={isFetching}
          totalVentas={data.totalVentas}
          totalPagos={data.totalPagos}
          diferencia={data.diferencia}
          pagos={data.pagos}
          totalesPorMetodoPago={data.totalesPorMetodoPago}
        />
      ) : (
        <CajaAsesorView
          isLoading={isFetching}
          totalVentas={data.totalVentas}
          totalPagos={data.totalPagos}
          diferencia={data.diferencia}
          pagos={data.pagos}
          totalesPorMetodoPago={data.totalesPorMetodoPago}
        />
      )}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
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

  // Estados para la query (solo se actualizan al buscar)
  const [fechaDesde, setFechaDesde] = useState<string>(getTodayString());
  const [fechaHasta, setFechaHasta] = useState<string>(getTodayString());

  const { data, isLoading, error } = useQuery({
    queryKey: ["caja-data", fechaDesde, fechaHasta],
    queryFn: async () => {
      const result = await getCajaDataAction(fechaDesde, fechaHasta);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const handleSearch = () => {
    // Validar que las fechas sean válidas
    if (!inputFechaDesde || !inputFechaHasta) {
      return;
    }

    // Validar que fechaDesde no sea mayor que fechaHasta
    if (inputFechaDesde > inputFechaHasta) {
      // Si la fecha desde es mayor, intercambiar
      setFechaDesde(inputFechaHasta);
      setFechaHasta(inputFechaDesde);
      setInputFechaDesde(inputFechaHasta);
      setInputFechaHasta(inputFechaDesde);
    } else {
      setFechaDesde(inputFechaDesde);
      setFechaHasta(inputFechaHasta);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (isLoading) {
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

        {/* Inputs de fecha */}
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
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              className="w-full sm:w-auto mt-1"
              disabled={isLoading}
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
          totalVentas={data.totalVentas}
          totalPagos={data.totalPagos}
          diferencia={data.diferencia}
          pagos={data.pagos}
          totalesPorMetodoPago={data.totalesPorMetodoPago}
        />
      ) : (
        <CajaAsesorView
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

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { useIsMobile } from "@/components/ui/use-mobile";
import type {
  InventoryControlBodega,
  InventoryControlTableRow,
} from "../types";

interface InventoryControlTableProps {
  data: InventoryControlTableRow[];
  bodegas: InventoryControlBodega[];
  isLoading: boolean;
  onQuantityClick: (
    productId: string,
    bodegaId: string,
    productName: string,
  ) => void;
}

export function InventoryControlTable({
  data,
  bodegas,
  isLoading,
  onQuantityClick,
}: InventoryControlTableProps) {
  const isMobile = useIsMobile();

  const columns: ColumnDef<InventoryControlTableRow, unknown>[] =
    useMemo(() => {
      const productColumn: ColumnDef<InventoryControlTableRow, unknown> = {
        id: "producto",
        header: "Producto",
        size: 240,
        cell: ({ row }) => (
          <div className="text-left font-medium">
            {row.original.producto.nombre}
          </div>
        ),
      };

      const bodegaColumns: ColumnDef<InventoryControlTableRow, unknown>[] =
        bodegas.map((bodega) => ({
          id: bodega.id,
          header: bodega.nombre,
          size: 120,
          cell: ({ row }) => {
            const cantidad = row.original.cantidadesPorBodega[bodega.id] || 0;

            if (cantidad > 0) {
              return (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full hover:bg-primary/10"
                  onClick={() =>
                    onQuantityClick(
                      row.original.producto.id,
                      bodega.id,
                      row.original.producto.nombre,
                    )
                  }
                >
                  {cantidad}
                </Button>
              );
            }

            return <span className="text-muted-foreground">-</span>;
          },
        }));

      return [productColumn, ...bodegaColumns];
    }, [bodegas, onQuantityClick]);

  // Vista desktop - tabla completa
  if (!isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Inventario por Bodega</h2>
        </div>
        <DataGrid
          data={data}
          columns={columns}
          isLoading={isLoading}
          getRowId={(row) => row.producto.id}
          showIndexColumn={false}
          tableId="inventory-control-by-warehouse"
        />
      </div>
    );
  }

  // Vista mobile - cards por producto
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventario por Bodega</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="flex-1 h-4 rounded bg-surface-2"></div>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 w-16 rounded bg-surface-2"></div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Inventario por Bodega</h2>
      {data.map((row) => (
        <Card key={row.producto.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{row.producto.nombre}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bodegas
              .filter((bodega) => (row.cantidadesPorBodega[bodega.id] || 0) > 0)
              .map((bodega) => {
                const cantidad = row.cantidadesPorBodega[bodega.id] || 0;
                return (
                  <div
                    key={bodega.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-surface-2"
                  >
                    <span className="text-sm font-medium">{bodega.nombre}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onQuantityClick(
                          row.producto.id,
                          bodega.id,
                          row.producto.nombre,
                        )
                      }
                    >
                      {cantidad} unidades
                    </Button>
                  </div>
                );
              })}
            {bodegas.every(
              (bodega) => (row.cantidadesPorBodega[bodega.id] || 0) === 0,
            ) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay unidades en ninguna bodega
              </p>
            )}
          </CardContent>
        </Card>
      ))}
      {data.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay productos en inventario físico
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Package, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSaleDetailsAction } from "../actions/get-sale-details";

interface ViewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string | null;
}

export function ViewSaleModal({ isOpen, onClose, saleId }: ViewSaleModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["sale-details", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      return await getSaleDetailsAction(saleId);
    },
    enabled: isOpen && !!saleId,
  });

  const saleDetails = data?.success ? data.data : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto sm:!max-w-[95vw] sm:!w-[95vw]">
        <DialogHeader>
          <DialogTitle>Ver Venta</DialogTitle>
          <DialogDescription>Detalles completos de la venta</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !saleDetails ? (
          <div className="text-center py-8 text-text-secondary">
            No se pudieron cargar los detalles de la venta
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Datos Generales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Datos Generales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="view-cliente">Cliente</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      id="view-cliente"
                      value={saleDetails.cliente ?? "-"}
                      readOnly
                      className="bg-muted pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="view-fecha">Fecha</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      id="view-fecha"
                      value={saleDetails.fechaLabel}
                      readOnly
                      className="bg-muted pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="view-monto-total">Monto Total</Label>
                  <Input
                    id="view-monto-total"
                    value={saleDetails.montoTotalFormatted}
                    readOnly
                    className="bg-muted font-semibold text-success"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="view-cantidad-equipos">
                    Cantidad de Equipos
                  </Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      id="view-cantidad-equipos"
                      value={saleDetails.cantidadEquipos}
                      readOnly
                      className="bg-muted pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="view-vendedor">Vendedor</Label>
                  <Input
                    id="view-vendedor"
                    value={saleDetails.vendedor ?? "-"}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Tabla de Productos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Productos</h3>
              {saleDetails.productos.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No hay productos en esta venta
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">
                          Nombre de Producto
                        </TableHead>
                        <TableHead className="min-w-[180px]">IMEI</TableHead>
                        <TableHead className="text-right min-w-[120px]">
                          Descuento
                        </TableHead>
                        <TableHead className="text-right min-w-[120px]">
                          Precio
                        </TableHead>
                        <TableHead className="text-right min-w-[120px]">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {saleDetails.productos.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell className="font-medium min-w-[200px]">
                            {producto.nombre}
                          </TableCell>
                          <TableCell className="text-text-secondary min-w-[180px] font-mono text-sm">
                            {producto.imei ?? "-"}
                          </TableCell>
                          <TableCell className="text-right min-w-[120px]">
                            {producto.descuentoFormatted}
                          </TableCell>
                          <TableCell className="text-right min-w-[120px]">
                            {producto.precioFormatted}
                          </TableCell>
                          <TableCell className="text-right font-semibold min-w-[120px]">
                            {producto.totalFormatted}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

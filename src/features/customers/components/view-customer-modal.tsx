"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Mail, Phone } from "lucide-react";
import { useMemo } from "react";
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
import type { CustomerDTO } from "../actions";
import { getCustomerSalesAction } from "../actions/get-customer-sales";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeStyle: "short",
});

interface ViewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDTO | null;
}

function getProductName(producto: {
  marca: { nombre: string } | null;
  modelo: {
    nombre: string;
    almacenamiento: string | null;
    color: string | null;
  } | null;
  almacenamiento: { capacidad: number } | null;
  color: { nombre: string } | null;
  descripcion: string | null;
}): string {
  const parts: string[] = [];

  if (producto.marca) {
    parts.push(producto.marca.nombre);
  }

  if (producto.modelo) {
    parts.push(producto.modelo.nombre);
    if (producto.modelo.almacenamiento) {
      parts.push(producto.modelo.almacenamiento);
    }
    if (producto.modelo.color) {
      parts.push(producto.modelo.color);
    }
  }

  if (producto.almacenamiento) {
    parts.push(String(producto.almacenamiento.capacidad));
  }

  if (producto.color) {
    parts.push(producto.color.nombre);
  }

  if (producto.descripcion) {
    parts.push(producto.descripcion);
  }

  return parts.filter(Boolean).join(" ") || "Producto sin nombre";
}

export function ViewCustomerModal({
  isOpen,
  onClose,
  customer,
}: ViewCustomerModalProps) {
  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ["customer-sales", customer?.id],
    queryFn: async () => {
      if (!customer) return null;
      return await getCustomerSalesAction(customer.id);
    },
    enabled: isOpen && !!customer,
  });

  const sales = salesData?.success ? salesData.data : [];
  const totalSales = useMemo(() => {
    return sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  }, [sales]);

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ver Cliente</DialogTitle>
          <DialogDescription>
            Información del cliente y su historial de compras
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Datos del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datos del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="view-nombre">Nombre</Label>
                <div className="relative">
                  <Input
                    id="view-nombre"
                    value={customer.nombre}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="view-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input
                    id="view-email"
                    type="email"
                    value={customer.email}
                    readOnly
                    className="bg-muted pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="view-telefono">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input
                    id="view-telefono"
                    value={customer.telefono ?? "-"}
                    readOnly
                    className="bg-muted pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="view-whatsapp">WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input
                    id="view-whatsapp"
                    value={customer.whatsapp ?? "-"}
                    readOnly
                    className="bg-muted pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resumen de Ventas */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">Total Ventas</div>
              <div className="text-lg font-semibold">{sales.length}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">Total General</div>
              <div className="text-2xl font-bold">
                {currencyFormatter.format(totalSales)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Historial de Compras */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Historial de Compras</h3>

            {isLoadingSales ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                No hay compras registradas para este cliente
              </div>
            ) : (
              <div className="space-y-6">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="border rounded-lg p-4 space-y-4 bg-card"
                  >
                    {/* Encabezado de la venta */}
                    <div className="flex items-center gap-2 border-b pb-2">
                      <Calendar className="h-4 w-4 text-text-secondary" />
                      <span className="text-sm font-medium">
                        Venta #{sale.consecutivo}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {dateFormatter.format(new Date(sale.createdAt))}
                      </span>
                    </div>

                    {/* Productos de la venta */}
                    <div className="space-y-2">
                      {sale.ventaProducto.map((ventaProducto) => {
                        return ventaProducto.productosDetalles.map(
                          (productoDetalle) => {
                            const productName = getProductName(
                              productoDetalle.producto,
                            );
                            const precio = Number(ventaProducto.precio);
                            const descuento = Number(ventaProducto.descuento);
                            const precioFinal = precio - descuento;

                            return (
                              <div
                                key={productoDetalle.id}
                                className="flex items-center justify-between py-2 border-b last:border-0"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {productName}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm">
                                    {/* {productName} */}
                                    {" -- "}
                                    {descuento > 0 ? (
                                      <>
                                        <span className="text-text-secondary">
                                          {currencyFormatter.format(descuento)}
                                        </span>
                                        {" -- "}
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-text-secondary">
                                          $0.00
                                        </span>
                                        {" -- "}
                                      </>
                                    )}
                                    <span className="font-semibold">
                                      {currencyFormatter.format(precioFinal)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        );
                      })}
                    </div>

                    {/* Total de la venta */}
                    <div className="flex justify-end pt-2 border-t">
                      <div className="text-right">
                        <div className="text-sm text-text-secondary">
                          Subtotal
                        </div>
                        <div className="text-lg font-bold">
                          {currencyFormatter.format(Number(sale.total))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

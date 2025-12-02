"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Package, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ViewModal, type ViewSection } from "@/components/ui/view-modal";
import { formatImeiForDisplay } from "@/lib/utils-imei";
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

  const sections: ViewSection[] = saleDetails
    ? [
        {
          title: "Datos Generales",
          fields: [
            {
              key: "cliente",
              label: "Cliente",
              value: saleDetails.cliente,
              icon: User,
            },
            {
              key: "fecha",
              label: "Fecha",
              value: saleDetails.fechaLabel,
              icon: Calendar,
            },
            {
              key: "monto-total",
              label: "Monto Total",
              value: saleDetails.montoTotalFormatted,
              colSpan: 2,
            },
            {
              key: "cantidad-equipos",
              label: "Cantidad de Equipos",
              value: saleDetails.cantidadEquipos,
              icon: Package,
            },
            { key: "vendedor", label: "Vendedor", value: saleDetails.vendedor },
          ],
        },
        {
          title: "Productos",
          fields: [],
          customContent:
            saleDetails.productos.length === 0 ? (
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
                          {formatImeiForDisplay(producto.imei)}
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
            ),
        },
      ]
    : [];

  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ver Venta"
      description="Detalles completos de la venta"
      sections={sections}
      size="full"
      isLoading={isLoading}
      errorMessage={
        !saleDetails && !isLoading
          ? "No se pudieron cargar los detalles de la venta"
          : undefined
      }
    />
  );
}

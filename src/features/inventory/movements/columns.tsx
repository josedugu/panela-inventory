import type { ColumnDef } from "@tanstack/react-table";
import type { InventoryMovementDTO } from "./actions/get-inventory-movements";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "short",
  timeStyle: "short",
});

export function getInventoryMovementColumns(): ColumnDef<InventoryMovementDTO>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => (
        <div className="text-sm text-text-secondary">
          {dateTimeFormatter.format(new Date(row.original.createdAt))}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "productLabel",
      header: "Producto",
      cell: ({ row }) => (
        <div className="wrap-break-word" title={row.original.productLabel}>
          {row.original.productLabel}
        </div>
      ),
      size: 240,
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.original.quantity}</div>
      ),
      size: 120,
      minSize: 80,
    },
    {
      accessorKey: "unitCost",
      header: "Costo unitario",
      cell: ({ row }) => (
        <div className="text-center">
          {currencyFormatter.format(row.original.unitCost)}
        </div>
      ),
      size: 150,
    },
    {
      accessorKey: "totalCost",
      header: "Total",
      cell: ({ row }) => (
        <div className="text-center">
          {currencyFormatter.format(row.original.totalCost)}
        </div>
      ),
      size: 150,
    },
    {
      accessorKey: "createdBy",
      header: "Creado por",
      cell: ({ row }) => row.original.createdBy ?? "-",
      size: 200,
    },
  ];
}

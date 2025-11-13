import type { ColumnDef } from "@tanstack/react-table";
import type { CustomerDTO } from "@/features/customers/actions";
import { formatPrice } from "@/lib/utils";

type Customer = CustomerDTO;

export function getCustomerColumns(): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.nombre}</div>
      ),
      size: 200,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm text-text-secondary">{row.original.email}</div>
      ),
      size: 240,
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.telefono ?? "-"}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "whatsapp",
      header: "WhatsApp",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.whatsapp ?? "-"}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "totalVentas",
      header: "Total Ventas",
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {formatPrice(row.original.totalVentas, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
      ),
      size: 150,
    },
  ];
}

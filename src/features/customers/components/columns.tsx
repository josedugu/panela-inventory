import type { ColumnDef } from "@tanstack/react-table";
import type { CustomerDTO } from "@/features/customers/actions";

type Customer = CustomerDTO;

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
});

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
          {currencyFormatter.format(row.original.totalVentas)}
        </div>
      ),
      size: 150,
    },
  ];
}

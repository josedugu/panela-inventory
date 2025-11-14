import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { TableAction } from "@/components/ui/table-actions-cell";
import { TableActionsCell } from "@/components/ui/table-actions-cell";
import type { SupplierDTO } from "@/data/repositories/suppliers.repository";

interface SupplierColumnsOptions {
  onEdit: (supplier: SupplierDTO) => void;
  onDelete: (supplier: SupplierDTO) => void;
  isBusy?: boolean;
}

export function getSupplierColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: SupplierColumnsOptions): ColumnDef<SupplierDTO>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium text-text">{row.original.nombre}</span>
      ),
    },
    {
      accessorKey: "contacto",
      header: "Contacto",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
    },
    {
      id: "direccion",
      header: "Dirección",
      cell: ({ row }) => row.original.direccion ?? "—",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const actions: TableAction<SupplierDTO>[] = [
          {
            label: "Editar",
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => onEdit(row.original),
            disabled: isBusy,
          },
          {
            label: "Eliminar",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => onDelete(row.original),
            disabled: isBusy,
            variant: "destructive",
          },
        ];

        return <TableActionsCell row={row.original} actions={actions} />;
      },
    },
  ];
}

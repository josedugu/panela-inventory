import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { TableAction } from "@/components/ui/table-actions-cell";
import { TableActionsCell } from "@/components/ui/table-actions-cell";
import type { WarehouseDTO } from "@/data/repositories/warehouses.repository";

interface WarehouseColumnsOptions {
  onEdit: (warehouse: WarehouseDTO) => void;
  onDelete: (warehouse: WarehouseDTO) => void;
  isBusy?: boolean;
}

export function getWarehouseColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: WarehouseColumnsOptions): ColumnDef<WarehouseDTO>[] {
  return [
    {
      accessorKey: "codigo",
      header: "Código",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.codigo}</span>
      ),
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      id: "actions",
      header: "Acciones",
      size: 80,
      minSize: 80,
      maxSize: 80,
      enableResizing: false,
      cell: ({ row }) => {
        const actions: TableAction<WarehouseDTO>[] = [
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

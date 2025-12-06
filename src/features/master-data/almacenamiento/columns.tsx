import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { TableAction } from "@/components/ui/table-actions-cell";
import { TableActionsCell } from "@/components/ui/table-actions-cell";
import type { StorageDTO } from "@/data/repositories/shared.repository";

interface StorageColumnsOptions {
  onEdit: (storage: StorageDTO) => void;
  onDelete: (storage: StorageDTO) => void;
  isBusy?: boolean;
}

export function getStorageColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: StorageColumnsOptions): ColumnDef<StorageDTO>[] {
  return [
    {
      accessorKey: "capacidad",
      header: "Capacidad",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.capacidad} GB
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      size: 80,
      minSize: 80,
      maxSize: 80,
      enableResizing: false,
      cell: ({ row }) => {
        const actions: TableAction<StorageDTO>[] = [
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

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { TableAction } from "@/components/ui/table-actions-cell";
import { TableActionsCell } from "@/components/ui/table-actions-cell";
import type { ModelDTO } from "@/data/repositories/shared.repository";

interface ModelColumnsOptions {
  onEdit: (model: ModelDTO) => void;
  onDelete: (model: ModelDTO) => void;
  isBusy?: boolean;
}

export function getModelColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: ModelColumnsOptions): ColumnDef<ModelDTO>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium text-text">{row.original.nombre}</span>
      ),
    },
    {
      accessorKey: "marcaNombre",
      header: "Marca",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const actions: TableAction<ModelDTO>[] = [
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

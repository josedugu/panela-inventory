import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { TableAction } from "@/components/ui/table-actions-cell";
import { TableActionsCell } from "@/components/ui/table-actions-cell";
import type { CostCenterDTO } from "@/data/repositories/shared.repository";

interface CostCenterColumnsOptions {
  onEdit: (costCenter: CostCenterDTO) => void;
  onDelete: (costCenter: CostCenterDTO) => void;
  isBusy?: boolean;
}

export function getCostCenterColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: CostCenterColumnsOptions): ColumnDef<CostCenterDTO>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => row.original.descripcion ?? "—",
    },
    {
      accessorKey: "responsable",
      header: "Responsable",
      cell: ({ row }) => row.original.responsable ?? "—",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const actions: TableAction<CostCenterDTO>[] = [
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

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            disabled={isBusy}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            disabled={isBusy}
          >
            <Trash2 className="h-4 w-4 text-error" />
          </Button>
        </div>
      ),
    },
  ];
}

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RamDTO } from "@/data/repositories/shared.repository";

interface RamColumnsOptions {
  onEdit: (ram: RamDTO) => void;
  onDelete: (ram: RamDTO) => void;
  isBusy?: boolean;
}

export function getRamColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: RamColumnsOptions): ColumnDef<RamDTO>[] {
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

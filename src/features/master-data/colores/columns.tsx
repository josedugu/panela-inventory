import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ColorDTO } from "@/data/repositories/shared.repository";

interface ColorColumnsOptions {
  onEdit: (color: ColorDTO) => void;
  onDelete: (color: ColorDTO) => void;
  isBusy?: boolean;
}

export function getColorColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: ColorColumnsOptions): ColumnDef<ColorDTO>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Nombre",
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

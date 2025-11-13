import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

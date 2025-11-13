import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductDTO } from "@/data/repositories/master.products.repository";
import { formatPrice } from "@/lib/utils";

interface ProductColumnsOptions {
  onEdit: (product: ProductDTO) => void;
  onDelete: (product: ProductDTO) => void;
  isBusy?: boolean;
}

export function getProductColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: ProductColumnsOptions): ColumnDef<ProductDTO>[] {
  return [
    {
      accessorKey: "tipoProductoNombre",
      header: "Tipo",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.tipoProductoNombre ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "marcaNombre",
      header: "Marca",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.marcaNombre ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "modeloNombre",
      header: "Modelo",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.modeloNombre ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "costo",
      header: "Costo",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.costo
            ? formatPrice(row.original.costo, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            : "—"}
        </div>
      ),
    },
    {
      accessorKey: "cantidad",
      header: "Cantidad",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.cantidad}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
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

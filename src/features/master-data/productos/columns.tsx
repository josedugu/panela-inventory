import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import {
  type TableAction,
  TableActionsCell,
} from "@/components/ui/table-actions-cell";
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
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center">{row.original.nombre ?? "—"}</div>
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
      accessorKey: "pvp",
      header: "PVP",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.pvp
            ? formatPrice(row.original.pvp, {
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
      accessorKey: "tipoProductoNombre",
      header: "Tipo",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.tipoProductoNombre ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              row.original.estado
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {row.original.estado ? "Activo" : "Inactivo"}
          </span>
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
        const actions: TableAction<ProductDTO>[] = [
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

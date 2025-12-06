import type { ColumnDef } from "@tanstack/react-table";
import { Gift, Pencil, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import type { TableAction } from "@/components/ui/table-actions-cell";
import { TableActionsCell } from "@/components/ui/table-actions-cell";
import type { TipoProductoDTO } from "@/data/repositories/shared.repository";

interface TipoProductoColumnsOptions {
  onEdit: (tipoProducto: TipoProductoDTO) => void;
  onDelete: (tipoProducto: TipoProductoDTO) => void;
  isBusy?: boolean;
}

export function getTipoProductoColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: TipoProductoColumnsOptions): ColumnDef<TipoProductoDTO>[] {
  return [
    {
      accessorKey: "nombre",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nombre" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-text">{row.original.nombre}</span>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => row.original.descripcion ?? "—",
    },
    {
      accessorKey: "productoBaseParaOferta",
      header: "Activa Oferta",
      cell: ({ row }) =>
        row.original.productoBaseParaOferta ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            <Gift className="h-3 w-3" />
            Sí
          </span>
        ) : (
          <span className="text-text-secondary">—</span>
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
        const actions: TableAction<TipoProductoDTO>[] = [
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

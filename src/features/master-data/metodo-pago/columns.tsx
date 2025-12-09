import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { TableAction } from "@/components/ui/table-actions-cell";
import { TableActionsCell } from "@/components/ui/table-actions-cell";
import type { MetodoPagoDTO } from "@/data/repositories/metodo-pago.repository";

interface MetodoPagoColumnsOptions {
  onEdit: (metodoPago: MetodoPagoDTO) => void;
  onDelete: (metodoPago: MetodoPagoDTO) => void;
  isBusy?: boolean;
}

export function getMetodoPagoColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: MetodoPagoColumnsOptions): ColumnDef<MetodoPagoDTO>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "esCredito",
      header: "Tipo",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.original.esCredito
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {row.original.esCredito ? "Crédito" : "Contado"}
        </span>
      ),
    },
    {
      accessorKey: "comisionAsesor",
      header: "Comisión Asesor (%)",
      cell: ({ row }) => (
        <span>
          {row.original.comisionAsesor != null
            ? `${row.original.comisionAsesor.toFixed(2)}%`
            : "No definido"}
        </span>
      ),
    },
    {
      accessorKey: "comisionPlataforma",
      header: "Comisión Plataforma (%)",
      cell: ({ row }) => (
        <span>
          {row.original.comisionPlataforma != null
            ? `${row.original.comisionPlataforma.toFixed(2)}%`
            : "No definido"}
        </span>
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
        const actions: TableAction<MetodoPagoDTO>[] = [
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

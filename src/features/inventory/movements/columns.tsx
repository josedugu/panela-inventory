import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import {
  type TableAction,
  TableActionsCell,
} from "@/components/ui/table-actions-cell";
import type { InventoryMovementDTO } from "./actions/get-inventory-movements";

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "short",
  timeStyle: "short",
});

interface InventoryMovementColumnsOptions {
  onView: (movement: InventoryMovementDTO) => void;
  isBusy?: boolean;
}

export function getInventoryMovementColumns({
  onView,
  isBusy = false,
}: InventoryMovementColumnsOptions): ColumnDef<InventoryMovementDTO>[] {
  return [
    {
      accessorKey: "consecutivo",
      header: "Consecutivo",
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.consecutivo}</div>
      ),
      size: 120,
      minSize: 100,
    },
    {
      accessorKey: "productLabel",
      header: "Producto",
      cell: ({ row }) => (
        <div className="wrap-break-word" title={row.original.productLabel}>
          {row.original.productLabel}
        </div>
      ),
      size: 240,
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.original.quantity}</div>
      ),
      size: 120,
      minSize: 80,
    },
    {
      accessorKey: "typeName",
      header: "Movimiento",
      cell: ({ row }) => <div className="text-sm">{row.original.typeName}</div>,
      size: 200,
    },
    {
      accessorKey: "createdBy",
      header: "Creado Por",
      cell: ({ row }) => (
        <div className="text-sm text-text-secondary">
          {row.original.createdBy ?? "-"}
        </div>
      ),
      size: 180,
      minSize: 150,
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => (
        <div className="text-sm text-text-secondary">
          {dateTimeFormatter.format(new Date(row.original.createdAt))}
        </div>
      ),
      size: 200,
    },
    {
      id: "actions",
      header: "Acciones",
      size: 80,
      minSize: 80,
      maxSize: 80,
      enableResizing: false,
      cell: ({ row }) => {
        const actions: TableAction<InventoryMovementDTO>[] = [
          {
            label: "Ver",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => onView(row.original),
            disabled: isBusy,
          },
        ];

        return <TableActionsCell row={row.original} actions={actions} />;
      },
    },
  ];
}

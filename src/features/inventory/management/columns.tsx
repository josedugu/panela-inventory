import type { ColumnDef } from "@tanstack/react-table";
import { MapPin } from "lucide-react";
import type { TableAction } from "@/components/ui/table-actions-cell";
import { TableActionsCell } from "@/components/ui/table-actions-cell";
import type { InventoryProduct } from "../functions/types";

interface InventoryColumnsOptions {
  onViewLocations: (product: InventoryProduct) => void;
}

export function getInventoryColumns({
  onViewLocations,
}: InventoryColumnsOptions): ColumnDef<InventoryProduct>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      size: 300,
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => (
        <div className="text-center">{row.original.quantity}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "pvp",
      header: "PVP",
      cell: ({ row }) => (
        <div className="text-center">${row.original.pvp.toFixed(2)}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "cost",
      header: "Costo",
      cell: ({ row }) => (
        <div className="text-center">${row.original.cost.toFixed(2)}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => <div>{row.original.category}</div>,
      size: 160,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const actions: TableAction<InventoryProduct>[] = [
          {
            label: "Ubicaciones",
            icon: <MapPin className="h-4 w-4" />,
            onClick: () => onViewLocations(row.original),
          },
        ];

        return <TableActionsCell row={row.original} actions={actions} />;
      },
      size: 100,
    },
  ];
}

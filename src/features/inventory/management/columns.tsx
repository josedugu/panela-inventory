import type { ColumnDef } from "@tanstack/react-table";
import { History, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TableAction } from "@/components/ui/table-actions-cell";
import { TableActionsCell } from "@/components/ui/table-actions-cell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils";
import type { InventoryProduct } from "../functions/types";

interface InventoryColumnsOptions {
  onViewLocations: (product: InventoryProduct) => void;
  onViewTimeline?: (product: InventoryProduct) => void;
}

export function getInventoryColumns({
  onViewLocations,
  onViewTimeline,
}: InventoryColumnsOptions): ColumnDef<InventoryProduct>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      size: 300,
    },
    {
      id: "bodegas",
      header: "Bodegas",
      cell: ({ row }) => {
        const bodegas = row.original.bodegas || [];

        if (bodegas.length === 0)
          return <span className="text-muted-foreground">-</span>;

        if (bodegas.length === 1) {
          return (
            <Badge variant="secondary" className="whitespace-nowrap">
              {bodegas[0]}
            </Badge>
          );
        }

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="cursor-help whitespace-nowrap"
                >
                  {bodegas
                    .slice(0, 2)
                    .map((b) => b.substring(0, 2).toUpperCase())
                    .join(", ")}
                  {bodegas.length > 2 ? ` +${bodegas.length - 2}` : ""}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <ul className="list-disc pl-4">
                  {bodegas.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 150,
    },
    {
      accessorKey: "quantity",
      header: "Cant.",
      cell: ({ row }) => (
        <div className="text-center">{row.original.quantity}</div>
      ),
      size: 80,
    },
    {
      accessorKey: "pvp",
      header: "PVP",
      cell: ({ row }) => (
        <div className="text-center">
          {formatPrice(row.original.pvp, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
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
        const actions: TableAction<InventoryProduct>[] = [];

        // Si el producto fue encontrado por IMEI, mostramos la opción de Movimientos (Timeline)
        if (row.original.foundByImei && onViewTimeline) {
          actions.push({
            label: "Movimientos",
            icon: <History className="h-4 w-4" />,
            onClick: () => onViewTimeline(row.original),
          });
        }

        // La acción de Ubicaciones siempre está disponible
        actions.push({
          label: "Ubicaciones",
          icon: <MapPin className="h-4 w-4" />,
          onClick: () => onViewLocations(row.original),
        });

        return <TableActionsCell row={row.original} actions={actions} />;
      },
      size: 100,
    },
  ];
}

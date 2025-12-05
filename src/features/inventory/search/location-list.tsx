"use client";

import {
  ChevronDown,
  ChevronRight,
  History,
  MapPin,
  Package,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ProductLocationItem,
  ProductLocationSummary,
} from "@/features/inventory/management/actions/get-product-locations";
import { getProductLocationItemsAction } from "@/features/inventory/management/actions/get-product-locations";

interface LocationCardProps {
  location: ProductLocationSummary;
  productId: string;
  onViewHistory: (item: ProductLocationItem) => void;
}

function LocationCard({
  location,
  productId,
  onViewHistory,
}: LocationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ProductLocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && !isLoaded && !isLoading) {
      setIsLoading(true);
      try {
        const result = await getProductLocationItemsAction(
          productId,
          location.bodegaId,
        );
        if (result.success) {
          setItems(result.data);
          setIsLoaded(true);
        } else {
          toast.error(result.error || "Error al cargar items");
        }
      } catch (_error) {
        toast.error("Error al cargar items de la bodega");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-lg bg-card overflow-hidden shadow-sm transition-all hover:shadow-md"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors w-full text-left"
          onClick={(e) => {
            // Prevenir doble toggle si el trigger hace click, pero necesitamos manejar la carga
            e.preventDefault();
            handleToggle();
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="font-medium text-base">{location.bodega}</div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {location.cantidad} unid.
            </Badge>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t bg-muted/5">
        <div className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span className="text-sm">Cargando items...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-muted/20">
                  <TableHead className="pl-6 h-9 text-xs uppercase tracking-wider">
                    Identificador / IMEI
                  </TableHead>
                  <TableHead className="w-[120px] text-right pr-6 h-9 text-xs uppercase tracking-wider">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="pl-6 font-mono text-sm py-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
                          {item.imei || "Sin IMEI"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-4 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewHistory(item);
                          }}
                        >
                          <History className="h-3.5 w-3.5 mr-2" />
                          Historial
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-6 text-muted-foreground text-sm"
                    >
                      No se encontraron items detallados disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface LocationListProps {
  locations: ProductLocationSummary[];
  productId: string;
  onViewHistory: (item: ProductLocationItem) => void;
  isLoading?: boolean;
}

export function LocationList({
  locations,
  productId,
  onViewHistory,
  isLoading,
}: LocationListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p>Obteniendo ubicaciones...</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
        <MapPin className="h-10 w-10 opacity-20 mb-2" />
        <p>No se encontraron ubicaciones para este producto</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pr-1">
      {locations.map((location) => (
        <LocationCard
          key={location.bodegaId}
          location={location}
          productId={productId}
          onViewHistory={onViewHistory}
        />
      ))}
    </div>
  );
}

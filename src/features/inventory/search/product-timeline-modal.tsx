"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  History,
  MapPin,
  Package,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProductTimelineAction } from "./actions/get-product-timeline";

interface ProductTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  productDetailId: string | null;
  initialData?: {
    imei: string;
    productName: string;
  };
}

export function ProductTimelineModal({
  isOpen,
  onClose,
  productDetailId,
  initialData,
}: ProductTimelineModalProps) {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ["product-timeline", productDetailId],
    queryFn: async () => {
      if (!productDetailId) return null;
      return getProductTimelineAction(productDetailId);
    },
    enabled: isOpen && !!productDetailId,
  });

  const events = timelineData?.success ? timelineData.data : [];
  const productName = timelineData?.success
    ? timelineData.productName
    : initialData?.productName;
  const imei = timelineData?.success ? timelineData.imei : initialData?.imei;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-6 pb-2 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg mt-1 hidden sm:block">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl">
                Historial del Producto
              </DialogTitle>
              <DialogDescription className="text-base">
                Movimientos y trazabilidad para {productName}
              </DialogDescription>
              {imei && (
                <Badge variant="outline" className="font-mono text-xs mt-2">
                  IMEI: {imei}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p>Cargando historial...</p>
            </div>
          ) : !events || events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Package className="h-12 w-12 opacity-20" />
              <p>No hay movimientos registrados para este ítem.</p>
            </div>
          ) : (
            <div className="relative border-l border-border ml-3 sm:ml-8 space-y-8 pb-8">
              {events.map((event, index) => (
                <div key={event.id} className="relative pl-6 sm:pl-8 group">
                  {/* Dot on timeline */}
                  <div
                    className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border ring-4 ring-background transition-colors ${
                      index === 0
                        ? "bg-primary border-primary"
                        : "bg-muted-foreground/30 border-transparent group-hover:bg-primary/60"
                    }`}
                  />

                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 sm:items-start">
                    {/* Date */}
                    <div className="min-w-[120px] pt-0.5">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {format(new Date(event.date), "d MMM, yyyy", {
                          locale: es,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground pl-5">
                        {format(new Date(event.date), "HH:mm", { locale: es })}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 bg-card border rounded-lg p-3 sm:p-4 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={event.isInput ? "default" : "destructive"}
                            className={
                              event.isInput
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-200 dark:border-emerald-800"
                                : ""
                            }
                          >
                            {event.isInput ? (
                              <ArrowDownRight className="mr-1 h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="mr-1 h-3 w-3" />
                            )}
                            {event.type}
                          </Badge>
                        </div>
                        <span
                          className={`text-sm font-bold ${event.isInput ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {event.isInput ? "+" : "-"}
                          {event.quantity}
                        </span>
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{event.bodega}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          <span>{event.user}</span>
                        </div>
                        {event.comment && (
                          <div className="mt-2 pt-2 border-t text-xs italic bg-muted/30 -mx-4 -mb-4 p-3 rounded-b-lg">
                            "{event.comment}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

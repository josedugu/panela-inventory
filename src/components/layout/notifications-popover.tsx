"use client";

import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Stock Bajo",
    description: "Galaxy Buds 2 tiene solo 5 unidades en stock",
    time: "Hace 5 min",
    read: false,
    type: "warning",
  },
  {
    id: "2",
    title: "Nueva Venta",
    description: "Se registró una venta de iPhone 15 Pro Max",
    time: "Hace 15 min",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Inventario Actualizado",
    description: "Se agregaron 50 nuevas unidades de Samsung Galaxy S24",
    time: "Hace 1 hora",
    read: true,
    type: "info",
  },
  {
    id: "4",
    title: "Pedido Procesado",
    description: "El pedido #ORD-2024-042 ha sido procesado exitosamente",
    time: "Hace 2 horas",
    read: true,
    type: "success",
  },
  {
    id: "5",
    title: "Producto Agotado",
    description: "AirPods Pro 2 se encuentra agotado",
    time: "Hace 3 horas",
    read: true,
    type: "error",
  },
];

interface NotificationsPopoverProps {
  onViewAll?: () => void;
}

export function NotificationsPopover({ onViewAll }: NotificationsPopoverProps) {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const recentNotifications = mockNotifications.slice(0, 5);

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "warning":
        return "text-warning";
      case "error":
        return "text-error";
      case "success":
        return "text-success";
      default:
        return "text-info";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h4 className="font-medium">Notificaciones</h4>
            <p className="text-sm text-text-secondary">
              Tienes {unreadCount} notificación{unreadCount !== 1 ? "es" : ""}{" "}
              sin leer
            </p>
          </div>
        </div>
        <ScrollArea className="h-[350px]">
          <div className="p-2">
            {recentNotifications.map((notification, index) => (
              <div key={notification.id}>
                <button
                  type="button"
                  className="w-full text-left p-3 rounded-lg hover:bg-surface-2 transition-colors"
                  onClick={() => {
                    // Handle notification click
                  }}
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        notification.read ? "bg-border" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${getNotificationColor(
                            notification.type,
                          )}`}
                        >
                          {notification.title}
                        </p>
                        <span className="text-xs text-text-tertiary whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                </button>
                {index < recentNotifications.length - 1 && (
                  <Separator className="my-1" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center"
            onClick={onViewAll}
          >
            Ver Todas las Notificaciones
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

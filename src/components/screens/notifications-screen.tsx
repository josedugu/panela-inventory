"use client";

import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Stock Bajo",
    description: "Galaxy Buds 2 tiene solo 5 unidades en stock. Se recomienda realizar un nuevo pedido pronto.",
    time: "Hace 5 min",
    date: "2024-01-20",
    read: false,
    type: "warning",
  },
  {
    id: "2",
    title: "Nueva Venta",
    description: "Se registró una venta de iPhone 15 Pro Max por un valor de $1,199.99",
    time: "Hace 15 min",
    date: "2024-01-20",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Inventario Actualizado",
    description: "Se agregaron 50 nuevas unidades de Samsung Galaxy S24 Ultra al inventario",
    time: "Hace 1 hora",
    date: "2024-01-20",
    read: true,
    type: "info",
  },
  {
    id: "4",
    title: "Pedido Procesado",
    description: "El pedido #ORD-2024-042 ha sido procesado exitosamente y está listo para envío",
    time: "Hace 2 horas",
    date: "2024-01-20",
    read: true,
    type: "success",
  },
  {
    id: "5",
    title: "Producto Agotado",
    description: "AirPods Pro 2 se encuentra agotado. Se requiere reabastecimiento urgente.",
    time: "Hace 3 horas",
    date: "2024-01-20",
    read: true,
    type: "error",
  },
  {
    id: "6",
    title: "Nuevo Proveedor Agregado",
    description: "Se ha agregado un nuevo proveedor: Xiaomi Corporation al sistema",
    time: "Hace 5 horas",
    date: "2024-01-20",
    read: true,
    type: "info",
  },
  {
    id: "7",
    title: "Actualización de Precios",
    description: "Los precios de 12 productos han sido actualizados según la nueva lista de precios",
    time: "Hace 1 día",
    date: "2024-01-19",
    read: true,
    type: "info",
  },
  {
    id: "8",
    title: "Meta de Ventas Alcanzada",
    description: "¡Felicitaciones! Se ha alcanzado la meta de ventas del mes",
    time: "Hace 1 día",
    date: "2024-01-19",
    read: true,
    type: "success",
  },
  {
    id: "9",
    title: "Recordatorio de Inventario",
    description: "Es momento de realizar el conteo físico mensual de inventario",
    time: "Hace 2 días",
    date: "2024-01-18",
    read: true,
    type: "warning",
  },
  {
    id: "10",
    title: "Nuevo Empleado",
    description: "Ana Martínez ha sido agregada como nueva empleada al sistema",
    time: "Hace 2 días",
    date: "2024-01-18",
    read: true,
    type: "info",
  },
];

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-l-warning";
      case "error":
        return "border-l-error";
      case "success":
        return "border-l-success";
      default:
        return "border-l-info";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "warning":
        return "Advertencia";
      case "error":
        return "Error";
      case "success":
        return "Éxito";
      default:
        return "Info";
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "secondary";
      case "error":
        return "destructive";
      case "success":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1>Notificaciones</h1>
          <p className="text-text-secondary mt-1">
            {unreadCount} notificación{unreadCount !== 1 ? "es" : ""} sin leer
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
          >
            {filter === "all" ? "Solo No Leídas" : "Todas"}
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Marcar Todas como Leídas
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-surface-2 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-text-tertiary" />
                </div>
                <div>
                  <h3>No hay notificaciones</h3>
                  <p className="text-text-secondary mt-1">
                    {filter === "unread"
                      ? "No tienes notificaciones sin leer"
                      : "Todas tus notificaciones aparecerán aquí"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-l-4 ${getNotificationColor(notification.type)} ${
                !notification.read ? "bg-surface-2" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Unread indicator */}
                  <div className="pt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        notification.read ? "bg-border" : "bg-primary"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {notification.description}
                        </p>
                      </div>
                      <span className="text-xs text-text-tertiary whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCheck className="w-4 h-4 mr-2" />
                          Marcar como leída
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2 text-error" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

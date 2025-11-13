import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import type { UserDTO } from "@/data/repositories/users.repository";

interface UserColumnsOptions {
  onEdit: (user: UserDTO) => void;
  onDelete: (user: UserDTO) => void;
  isBusy?: boolean;
}

export function getUserColumns({
  onEdit,
  onDelete,
  isBusy = false,
}: UserColumnsOptions): ColumnDef<UserDTO>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium text-text">{row.original.nombre}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => row.original.telefono ?? "—",
    },
    {
      accessorKey: "rolNombre",
      header: "Rol",
      cell: ({ row }) => row.original.rolNombre ?? "Sin rol",
    },
    {
      accessorKey: "centroCostoNombre",
      header: "Centro de costo",
      cell: ({ row }) => row.original.centroCostoNombre ?? "Sin asignar",
    },
    {
      id: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.original.estado;
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
              isActive
                ? "bg-success-light text-success-foreground"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {isActive ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            disabled={isBusy}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            disabled={isBusy}
          >
            <Trash2 className="h-4 w-4 text-error" />
          </Button>
        </div>
      ),
    },
  ];
}

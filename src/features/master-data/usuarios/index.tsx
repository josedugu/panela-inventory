"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import type { CostCenterDTO } from "@/data/repositories/shared.repository";
import type { UserDTO } from "@/data/repositories/users.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteUserAction,
  upsertUserAction,
} from "@/features/master-data/actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface UsersSectionProps {
  users: UserDTO[];
  costCenters: CostCenterDTO[];
  onRefresh: () => void;
}

interface UserFormState {
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  centroCostoId: string;
  estado: "activo" | "inactivo";
}

type DialogMode = "create" | "edit" | null;

const createEmptyFormState = (): UserFormState => ({
  nombre: "",
  email: "",
  telefono: "",
  rol: "",
  centroCostoId: "",
  estado: "activo",
});

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function UsersSection({
  users,
  costCenters,
  onRefresh,
}: UsersSectionProps) {
  const {
    data,
    total,
    page,
    pageSize,
    search,
    setSearch,
    filterState,
    setFilterState,
    pendingFilterState,
    setPendingFilterState,
    handleApplyFilters,
    handleResetPendingFilters,
    handleClearFilters,
    isFilterDialogOpen,
    setFilterDialogOpen,
    filterOptions,
    onPageChange,
    onPageSizeChange,
  } = useMasterDataTable<UserDTO>({
    items: users,
    filters: FILTER_DESCRIPTORS,
    searchableFields: [
      (user) => user.nombre,
      (user) => user.email,
      (user) => user.rolNombre ?? "",
      (user) => user.telefono ?? "",
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<UserFormState>(
    createEmptyFormState(),
  );
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const openCreateDialog = () => {
    setFormData(createEmptyFormState());
    setEditingUser(null);
    setDialogMode("create");
  };

  const openEditDialog = (user: UserDTO) => {
    setFormData({
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono ?? "",
      rol: user.rolNombre ?? "",
      centroCostoId: user.centroCostoId ?? "",
      estado: user.estado ? "activo" : "inactivo",
    });
    setEditingUser(user);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingUser(null);
    setFormData(createEmptyFormState());
  };

  const openDeleteDialog = (user: UserDTO) => {
    setDeleteTarget(user);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleFormChange = (field: keyof UserFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!formData.rol.trim()) {
      toast.error("Ingresa un rol para el usuario.");
      return;
    }

    const payload = {
      id: editingUser?.id,
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim() ? formData.telefono.trim() : undefined,
      rol: formData.rol.trim(),
      centroCostoId: formData.centroCostoId
        ? formData.centroCostoId
        : undefined,
      estado: formData.estado === "activo",
    };

    startSubmitTransition(async () => {
      const result = await upsertUserAction(payload);
      if (!result.success) {
        toast.error(result.error ?? "Error al guardar el usuario");
        return;
      }

      toast.success(
        editingUser
          ? "Usuario actualizado exitosamente"
          : "Usuario agregado exitosamente",
      );
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteUserAction(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error ?? "Error al eliminar el usuario");
        return;
      }

      toast.success("Usuario eliminado exitosamente");
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns: ColumnDef<UserDTO>[] = [
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
            onClick={() => openEditDialog(row.original)}
            disabled={isBusy}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => openDeleteDialog(row.original)}
            disabled={isBusy}
          >
            <Trash2 className="h-4 w-4 text-error" />
          </Button>
        </div>
      ),
    },
  ];

  const config = {
    title: "Usuarios",
    description: `${users.length} usuarios registrados`,
    addAction: {
      label: "Agregar usuario",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (user: UserDTO) => openDeleteDialog(user),
    getRowId: (user: UserDTO) => user.id,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle =
    dialogMode === "edit" ? "Editar usuario" : "Nuevo usuario";
  const dialogDescription =
    dialogMode === "edit"
      ? "Actualiza la información del usuario seleccionado."
      : "Ingresa los datos del nuevo usuario.";

  return (
    <>
      <EntityTableLayout
        config={config}
        data={data}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        searchValue={search}
        onSearchChange={setSearch}
        filters={FILTER_DESCRIPTORS}
        filterState={filterState}
        onFilterStateChange={setFilterState}
        pendingFilterState={pendingFilterState}
        onPendingFilterStateChange={setPendingFilterState}
        onApplyFilters={handleApplyFilters}
        onResetPendingFilters={handleResetPendingFilters}
        onClearFilters={handleClearFilters}
        isFilterDialogOpen={isFilterDialogOpen}
        setFilterDialogOpen={setFilterDialogOpen}
        filterOptions={filterOptions}
        isLoading={isBusy}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-nombre">Nombre completo *</Label>
                <Input
                  id="user-nombre"
                  value={formData.nombre}
                  onChange={(event) =>
                    handleFormChange("nombre", event.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    handleFormChange("email", event.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-telefono">Teléfono</Label>
                <Input
                  id="user-telefono"
                  value={formData.telefono}
                  onChange={(event) =>
                    handleFormChange("telefono", event.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-rol">Rol *</Label>
                <Input
                  id="user-rol"
                  value={formData.rol}
                  onChange={(event) =>
                    handleFormChange("rol", event.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-centro">Centro de costo</Label>
                <Select
                  value={formData.centroCostoId}
                  onValueChange={(value) =>
                    handleFormChange("centroCostoId", value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="user-centro">
                    <SelectValue placeholder="Sin centro asignado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin centro asignado</SelectItem>
                    {costCenters.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-estado">Estado *</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleFormChange("estado", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="user-estado">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {dialogMode === "edit" ? "Guardar cambios" : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar el usuario ${deleteTarget.nombre} (${deleteTarget.email})? Esta acción no se puede deshacer.`
                : "¿Seguro que deseas eliminar este usuario?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={closeDeleteDialog}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

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
import { Textarea } from "@/components/ui/textarea";
import type { StorageDTO } from "@/data/repositories/master-data.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteStorageAction,
  upsertStorageAction,
} from "@/features/master-data/actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface StorageSectionProps {
  storageOptions: StorageDTO[];
  onRefresh: () => void;
}

interface StorageFormState {
  capacidad: string;
  tipo: string;
  descripcion: string;
}

type DialogMode = "create" | "edit" | null;

const createEmptyFormState = (): StorageFormState => ({
  capacidad: "",
  tipo: "",
  descripcion: "",
});

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function StorageSection({
  storageOptions,
  onRefresh,
}: StorageSectionProps) {
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
  } = useMasterDataTable<StorageDTO>({
    items: storageOptions,
    filters: FILTER_DESCRIPTORS,
    searchableFields: [
      (option) => option.capacidad,
      (option) => option.tipo ?? "",
      (option) => option.descripcion ?? "",
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<StorageFormState>(
    createEmptyFormState(),
  );
  const [editingOption, setEditingOption] = useState<StorageDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StorageDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const openCreateDialog = () => {
    setFormData(createEmptyFormState());
    setEditingOption(null);
    setDialogMode("create");
  };

  const openEditDialog = (option: StorageDTO) => {
    setFormData({
      capacidad: option.capacidad,
      tipo: option.tipo ?? "",
      descripcion: option.descripcion ?? "",
    });
    setEditingOption(option);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingOption(null);
    setFormData(createEmptyFormState());
  };

  const openDeleteDialog = (option: StorageDTO) => {
    setDeleteTarget(option);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleFormChange = (field: keyof StorageFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const payload = {
      id: editingOption?.id,
      capacidad: formData.capacidad.trim(),
      tipo: formData.tipo.trim() ? formData.tipo.trim() : undefined,
      descripcion: formData.descripcion.trim()
        ? formData.descripcion.trim()
        : undefined,
    };

    startSubmitTransition(async () => {
      const result = await upsertStorageAction(payload);
      if (!result.success) {
        toast.error(result.error ?? "Error al guardar la configuración");
        return;
      }

      toast.success(
        editingOption
          ? "Configuración de almacenamiento actualizada"
          : "Configuración de almacenamiento agregada",
      );
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteStorageAction(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error ?? "Error al eliminar la configuración");
        return;
      }

      toast.success("Configuración de almacenamiento eliminada");
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns: ColumnDef<StorageDTO>[] = [
    {
      accessorKey: "capacidad",
      header: "Capacidad",
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => row.original.tipo ?? "—",
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => row.original.descripcion ?? "—",
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
    title: "Almacenamiento",
    description: `${storageOptions.length} configuraciones registradas`,
    addAction: {
      label: "Agregar almacenamiento",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (option: StorageDTO) => openDeleteDialog(option),
    getRowId: (option: StorageDTO) => option.id,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle =
    dialogMode === "edit"
      ? "Editar configuración de almacenamiento"
      : "Nueva configuración de almacenamiento";
  const dialogDescription =
    dialogMode === "edit"
      ? "Actualiza la configuración seleccionada."
      : "Ingresa los datos de la nueva configuración.";

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
          if (!open) closeDialog();
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
                <Label htmlFor="storage-capacidad">Capacidad *</Label>
                <Input
                  id="storage-capacidad"
                  value={formData.capacidad}
                  onChange={(event) =>
                    handleFormChange("capacidad", event.target.value)
                  }
                  placeholder="Ej: 128 GB"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage-tipo">Tipo</Label>
                <Input
                  id="storage-tipo"
                  value={formData.tipo}
                  onChange={(event) =>
                    handleFormChange("tipo", event.target.value)
                  }
                  placeholder="Ej: SSD, eUFS"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage-descripcion">Descripción</Label>
              <Textarea
                id="storage-descripcion"
                rows={3}
                value={formData.descripcion}
                onChange={(event) =>
                  handleFormChange("descripcion", event.target.value)
                }
                disabled={isSubmitting}
              />
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
          if (!open) closeDeleteDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Eliminar configuración de almacenamiento
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar la capacidad ${deleteTarget.capacidad}? Esta acción no se puede deshacer.`
                : "¿Seguro que deseas eliminar esta configuración?"}
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

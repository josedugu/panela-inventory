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
import type { RamDTO } from "@/data/repositories/shared.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteRamAction,
  upsertRamAction,
} from "@/features/master-data/actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface RamSectionProps {
  ramOptions: RamDTO[];
  onRefresh: () => void;
}

interface RamFormState {
  capacidad: string;
}

type DialogMode = "create" | "edit" | null;

const createEmptyFormState = (): RamFormState => ({
  capacidad: "",
});

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function RamSection({ ramOptions, onRefresh }: RamSectionProps) {
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
  } = useMasterDataTable<RamDTO>({
    items: ramOptions,
    filters: FILTER_DESCRIPTORS,
    searchableFields: [(option) => option.capacidad.toString()],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<RamFormState>(
    createEmptyFormState(),
  );
  const [editingOption, setEditingOption] = useState<RamDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RamDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const openCreateDialog = () => {
    setFormData(createEmptyFormState());
    setEditingOption(null);
    setDialogMode("create");
  };

  const openEditDialog = (option: RamDTO) => {
    setFormData({
      capacidad: option.capacidad.toString(),
    });
    setEditingOption(option);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingOption(null);
    setFormData(createEmptyFormState());
  };

  const openDeleteDialog = (option: RamDTO) => {
    setDeleteTarget(option);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleFormChange = (field: keyof RamFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const capacidadNumber = parseInt(formData.capacidad.trim(), 10);
    if (isNaN(capacidadNumber) || capacidadNumber <= 0) {
      toast.error("La capacidad debe ser un número positivo");
      return;
    }

    const payload = {
      id: editingOption?.id,
      capacidad: capacidadNumber,
    };

    startSubmitTransition(async () => {
      const result = await upsertRamAction(payload);
      if (!result.success) {
        toast.error(result.error ?? "Error al guardar la configuración de RAM");
        return;
      }

      toast.success(
        editingOption
          ? "Configuración de RAM actualizada"
          : "Configuración de RAM agregada",
      );
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteRamAction(deleteTarget.id);
      if (!result.success) {
        toast.error(
          result.error ?? "Error al eliminar la configuración de RAM",
        );
        return;
      }

      toast.success("Configuración de RAM eliminada");
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns: ColumnDef<RamDTO>[] = [
    {
      accessorKey: "capacidad",
      header: "Capacidad",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.capacidad} GB
        </div>
      ),
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
    title: "RAM",
    description: `${ramOptions.length} configuraciones registradas`,
    addAction: {
      label: "Agregar RAM",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (option: RamDTO) => openDeleteDialog(option),
    getRowId: (option: RamDTO) => option.id,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle =
    dialogMode === "edit"
      ? "Editar configuración de RAM"
      : "Nueva configuración de RAM";
  const dialogDescription =
    dialogMode === "edit"
      ? "Actualiza la configuración seleccionada."
      : "Ingresa los datos de la nueva configuración de RAM.";

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
            <div className="space-y-2">
              <Label htmlFor="ram-capacidad">Capacidad (GB) *</Label>
              <Input
                id="ram-capacidad"
                type="number"
                min="1"
                step="1"
                value={formData.capacidad}
                onChange={(event) =>
                  handleFormChange("capacidad", event.target.value)
                }
                placeholder="Ej: 8"
                required
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
            <AlertDialogTitle>Eliminar configuración de RAM</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar la RAM ${deleteTarget.capacidad}? Esta acción no se puede deshacer.`
                : "¿Seguro que deseas eliminar esta configuración de RAM?"}
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

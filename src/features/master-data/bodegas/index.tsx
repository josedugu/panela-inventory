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
import type { WarehouseDTO } from "@/data/repositories/master-data.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteWarehouseAction,
  upsertWarehouseAction,
} from "@/features/master-data/actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface WarehousesSectionProps {
  warehouses: WarehouseDTO[];
  onRefresh: () => void;
}

interface WarehouseFormState {
  codigo: string;
  nombre: string;
  ubicacion: string;
  capacidad: string;
  responsable: string;
}

type DialogMode = "create" | "edit" | null;

const createEmptyFormState = (): WarehouseFormState => ({
  codigo: "",
  nombre: "",
  ubicacion: "",
  capacidad: "",
  responsable: "",
});

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function WarehousesSection({
  warehouses,
  onRefresh,
}: WarehousesSectionProps) {
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
  } = useMasterDataTable<WarehouseDTO>({
    items: warehouses,
    filters: FILTER_DESCRIPTORS,
    searchableFields: [
      (warehouse) => warehouse.nombre,
      (warehouse) => warehouse.codigo,
      (warehouse) => warehouse.ubicacion ?? "",
      (warehouse) => warehouse.responsable ?? "",
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<WarehouseFormState>(
    createEmptyFormState(),
  );
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseDTO | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<WarehouseDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const openCreateDialog = () => {
    setFormData(createEmptyFormState());
    setEditingWarehouse(null);
    setDialogMode("create");
  };

  const openEditDialog = (warehouse: WarehouseDTO) => {
    setFormData({
      codigo: warehouse.codigo,
      nombre: warehouse.nombre,
      ubicacion: warehouse.ubicacion ?? "",
      capacidad: warehouse.capacidad ?? "",
      responsable: warehouse.responsable ?? "",
    });
    setEditingWarehouse(warehouse);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingWarehouse(null);
    setFormData(createEmptyFormState());
  };

  const openDeleteDialog = (warehouse: WarehouseDTO) => {
    setDeleteTarget(warehouse);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleFormChange = (field: keyof WarehouseFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const payload = {
      id: editingWarehouse?.id,
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim(),
      ubicacion: formData.ubicacion.trim()
        ? formData.ubicacion.trim()
        : undefined,
      capacidad: formData.capacidad.trim()
        ? formData.capacidad.trim()
        : undefined,
      responsable: formData.responsable.trim()
        ? formData.responsable.trim()
        : undefined,
    };

    startSubmitTransition(async () => {
      const result = await upsertWarehouseAction(payload);
      if (!result.success) {
        toast.error(result.error ?? "Error al guardar la bodega");
        return;
      }

      toast.success(
        editingWarehouse
          ? "Bodega actualizada exitosamente"
          : "Bodega agregada exitosamente",
      );
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteWarehouseAction(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error ?? "Error al eliminar la bodega");
        return;
      }

      toast.success("Bodega eliminada exitosamente");
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns: ColumnDef<WarehouseDTO>[] = [
    {
      accessorKey: "codigo",
      header: "Código",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.codigo}</span>
      ),
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "ubicacion",
      header: "Ubicación",
      cell: ({ row }) => row.original.ubicacion ?? "—",
    },
    {
      accessorKey: "capacidad",
      header: "Capacidad",
      cell: ({ row }) => row.original.capacidad ?? "—",
    },
    {
      accessorKey: "responsable",
      header: "Responsable",
      cell: ({ row }) => row.original.responsable ?? "—",
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
    title: "Bodegas",
    description: `${warehouses.length} bodegas registradas`,
    addAction: {
      label: "Agregar bodega",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (warehouse: WarehouseDTO) => openDeleteDialog(warehouse),
    getRowId: (warehouse: WarehouseDTO) => warehouse.id,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle = dialogMode === "edit" ? "Editar bodega" : "Nueva bodega";
  const dialogDescription =
    dialogMode === "edit"
      ? "Actualiza la información de la bodega seleccionada."
      : "Ingresa los datos de la nueva bodega.";

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
                <Label htmlFor="warehouse-codigo">Código *</Label>
                <Input
                  id="warehouse-codigo"
                  value={formData.codigo}
                  onChange={(event) =>
                    handleFormChange("codigo", event.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse-nombre">Nombre *</Label>
                <Input
                  id="warehouse-nombre"
                  value={formData.nombre}
                  onChange={(event) =>
                    handleFormChange("nombre", event.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse-ubicacion">Ubicación</Label>
                <Input
                  id="warehouse-ubicacion"
                  value={formData.ubicacion}
                  onChange={(event) =>
                    handleFormChange("ubicacion", event.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse-capacidad">Capacidad</Label>
                <Input
                  id="warehouse-capacidad"
                  value={formData.capacidad}
                  onChange={(event) =>
                    handleFormChange("capacidad", event.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse-responsable">Responsable</Label>
              <Input
                id="warehouse-responsable"
                value={formData.responsable}
                onChange={(event) =>
                  handleFormChange("responsable", event.target.value)
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
            <AlertDialogTitle>Eliminar bodega</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar la bodega ${deleteTarget.nombre}? Esta acción no se puede deshacer.`
                : "¿Seguro que deseas eliminar esta bodega?"}
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

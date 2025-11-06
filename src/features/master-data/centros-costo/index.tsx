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
import type { CostCenterDTO } from "@/data/repositories/master-data.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteCostCenterAction,
  upsertCostCenterAction,
} from "@/features/master-data/actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface CostCentersSectionProps {
  costCenters: CostCenterDTO[];
  onRefresh: () => void;
}

interface CostCenterFormState {
  codigo: string;
  nombre: string;
  descripcion: string;
  responsable: string;
}

type DialogMode = "create" | "edit" | null;

const createEmptyFormState = (): CostCenterFormState => ({
  codigo: "",
  nombre: "",
  descripcion: "",
  responsable: "",
});

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function CostCentersSection({
  costCenters,
  onRefresh,
}: CostCentersSectionProps) {
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
  } = useMasterDataTable<CostCenterDTO>({
    items: costCenters,
    filters: FILTER_DESCRIPTORS,
    searchableFields: [
      (center) => center.nombre,
      (center) => center.codigo,
      (center) => center.responsable ?? "",
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<CostCenterFormState>(
    createEmptyFormState(),
  );
  const [editingCenter, setEditingCenter] = useState<CostCenterDTO | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<CostCenterDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const openCreateDialog = () => {
    setFormData(createEmptyFormState());
    setEditingCenter(null);
    setDialogMode("create");
  };

  const openEditDialog = (center: CostCenterDTO) => {
    setFormData({
      codigo: center.codigo,
      nombre: center.nombre,
      descripcion: center.descripcion ?? "",
      responsable: center.responsable ?? "",
    });
    setEditingCenter(center);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingCenter(null);
    setFormData(createEmptyFormState());
  };

  const openDeleteDialog = (center: CostCenterDTO) => {
    setDeleteTarget(center);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleFormChange = (
    field: keyof CostCenterFormState,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const payload = {
      id: editingCenter?.id,
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim()
        ? formData.descripcion.trim()
        : undefined,
      responsable: formData.responsable.trim()
        ? formData.responsable.trim()
        : undefined,
    };

    startSubmitTransition(async () => {
      const result = await upsertCostCenterAction(payload);
      if (!result.success) {
        toast.error(result.error ?? "Error al guardar el centro de costo");
        return;
      }

      toast.success(
        editingCenter
          ? "Centro de costo actualizado exitosamente"
          : "Centro de costo agregado exitosamente",
      );
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteCostCenterAction(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error ?? "Error al eliminar el centro de costo");
        return;
      }

      toast.success("Centro de costo eliminado exitosamente");
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns: ColumnDef<CostCenterDTO>[] = [
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
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => row.original.descripcion ?? "—",
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
    title: "Centros de costo",
    description: `${costCenters.length} centros registrados`,
    addAction: {
      label: "Agregar centro de costo",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (center: CostCenterDTO) => openDeleteDialog(center),
    getRowId: (center: CostCenterDTO) => center.id,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle =
    dialogMode === "edit" ? "Editar centro de costo" : "Nuevo centro de costo";
  const dialogDescription =
    dialogMode === "edit"
      ? "Actualiza la información del centro de costo seleccionado."
      : "Ingresa los datos del nuevo centro de costo.";

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
                <Label htmlFor="cost-center-codigo">Código *</Label>
                <Input
                  id="cost-center-codigo"
                  value={formData.codigo}
                  onChange={(event) =>
                    handleFormChange("codigo", event.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-center-nombre">Nombre *</Label>
                <Input
                  id="cost-center-nombre"
                  value={formData.nombre}
                  onChange={(event) =>
                    handleFormChange("nombre", event.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-center-descripcion">Descripción</Label>
              <Textarea
                id="cost-center-descripcion"
                rows={3}
                value={formData.descripcion}
                onChange={(event) =>
                  handleFormChange("descripcion", event.target.value)
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-center-responsable">Responsable</Label>
              <Input
                id="cost-center-responsable"
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
            <AlertDialogTitle>Eliminar centro de costo</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar el centro ${deleteTarget.nombre}? Esta acción no se puede deshacer.`
                : "¿Seguro que deseas eliminar este centro de costo?"}
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

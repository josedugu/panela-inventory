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
import type { BrandDTO } from "@/data/repositories/master-data.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteBrandAction,
  upsertBrandAction,
} from "@/features/master-data/actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface BrandsSectionProps {
  brands: BrandDTO[];
  onRefresh: () => void;
}

interface BrandFormState {
  nombre: string;
  descripcion: string;
  pais: string;
}

type DialogMode = "create" | "edit" | null;

const createEmptyFormState = (): BrandFormState => ({
  nombre: "",
  descripcion: "",
  pais: "",
});

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function BrandsSection({ brands, onRefresh }: BrandsSectionProps) {
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
  } = useMasterDataTable<BrandDTO>({
    items: brands,
    filters: FILTER_DESCRIPTORS,
    searchableFields: [
      (brand) => brand.nombre,
      (brand) => brand.pais ?? "",
      (brand) => brand.descripcion ?? "",
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<BrandFormState>(
    createEmptyFormState(),
  );
  const [editingBrand, setEditingBrand] = useState<BrandDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const openCreateDialog = () => {
    setFormData(createEmptyFormState());
    setEditingBrand(null);
    setDialogMode("create");
  };

  const openEditDialog = (brand: BrandDTO) => {
    setFormData({
      nombre: brand.nombre,
      descripcion: brand.descripcion ?? "",
      pais: brand.pais ?? "",
    });
    setEditingBrand(brand);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingBrand(null);
    setFormData(createEmptyFormState());
  };

  const openDeleteDialog = (brand: BrandDTO) => {
    setDeleteTarget(brand);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleFormChange = (field: keyof BrandFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const payload = {
      id: editingBrand?.id,
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim()
        ? formData.descripcion.trim()
        : undefined,
      pais: formData.pais.trim() ? formData.pais.trim() : undefined,
    };

    startSubmitTransition(async () => {
      const result = await upsertBrandAction(payload);
      if (!result.success) {
        toast.error(result.error ?? "Error al guardar la marca");
        return;
      }

      toast.success(
        editingBrand
          ? "Marca actualizada exitosamente"
          : "Marca agregada exitosamente",
      );
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteBrandAction(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error ?? "Error al eliminar la marca");
        return;
      }

      toast.success("Marca eliminada exitosamente");
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns: ColumnDef<BrandDTO>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium text-text">{row.original.nombre}</span>
      ),
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
    title: "Marcas",
    description: `${brands.length} marcas registradas`,
    addAction: {
      label: "Agregar marca",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (brand: BrandDTO) => openDeleteDialog(brand),
    getRowId: (brand: BrandDTO) => brand.id,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle = dialogMode === "edit" ? "Editar marca" : "Nueva marca";
  const dialogDescription =
    dialogMode === "edit"
      ? "Actualiza la información de la marca seleccionada."
      : "Ingresa los datos de la nueva marca.";

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
                <Label htmlFor="brand-nombre">Nombre *</Label>
                <Input
                  id="brand-nombre"
                  value={formData.nombre}
                  onChange={(event) =>
                    handleFormChange("nombre", event.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand-pais">País de origen</Label>
                <Input
                  id="brand-pais"
                  value={formData.pais}
                  onChange={(event) =>
                    handleFormChange("pais", event.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-descripcion">Descripción</Label>
              <Textarea
                id="brand-descripcion"
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
          if (!open) {
            closeDeleteDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar marca</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar la marca ${deleteTarget.nombre}? Esta acción no se puede deshacer.`
                : "¿Seguro que deseas eliminar esta marca?"}
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

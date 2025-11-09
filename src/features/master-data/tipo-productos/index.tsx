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
  type TableAction,
  TableActionsCell,
} from "@/components/ui/table-actions-cell";
import { Textarea } from "@/components/ui/textarea";
import type { TipoProductoDTO } from "@/data/repositories/shared.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteTipoProductoAction,
  upsertTipoProductoAction,
} from "@/features/master-data/actions/tipo-producto.actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface TipoProductosSectionProps {
  tipoProductos: TipoProductoDTO[];
  onRefresh: () => void;
}

interface TipoProductoFormState {
  nombre: string;
  descripcion: string;
}

type DialogMode = "create" | "edit" | null;

const createEmptyFormState = (): TipoProductoFormState => ({
  nombre: "",
  descripcion: "",
});

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function TipoProductosSection({
  tipoProductos,
  onRefresh,
}: TipoProductosSectionProps) {
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
  } = useMasterDataTable<TipoProductoDTO>({
    items: tipoProductos,
    filters: FILTER_DESCRIPTORS,
    searchableFields: [(tipo) => tipo.nombre, (tipo) => tipo.descripcion ?? ""],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<TipoProductoFormState>(
    createEmptyFormState(),
  );
  const [editingTipoProducto, setEditingTipoProducto] =
    useState<TipoProductoDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TipoProductoDTO | null>(
    null,
  );
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const openCreateDialog = () => {
    setFormData(createEmptyFormState());
    setEditingTipoProducto(null);
    setDialogMode("create");
  };

  const openEditDialog = (tipoProducto: TipoProductoDTO) => {
    setFormData({
      nombre: tipoProducto.nombre,
      descripcion: tipoProducto.descripcion ?? "",
    });
    setEditingTipoProducto(tipoProducto);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingTipoProducto(null);
    setFormData(createEmptyFormState());
  };

  const openDeleteDialog = (tipoProducto: TipoProductoDTO) => {
    setDeleteTarget(tipoProducto);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleFormChange = (
    field: keyof TipoProductoFormState,
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
      id: editingTipoProducto?.id,
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim()
        ? formData.descripcion.trim()
        : undefined,
    };

    startSubmitTransition(async () => {
      const result = await upsertTipoProductoAction(payload);
      if (!result.success) {
        toast.error(result.error ?? "Error al guardar el tipo de producto");
        return;
      }

      toast.success(
        editingTipoProducto
          ? "Tipo de producto actualizado exitosamente"
          : "Tipo de producto agregado exitosamente",
      );
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteTipoProductoAction(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error ?? "Error al eliminar el tipo de producto");
        return;
      }

      toast.success("Tipo de producto eliminado exitosamente");
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns: ColumnDef<TipoProductoDTO>[] = [
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
      cell: ({ row }) => {
        const actions: TableAction<TipoProductoDTO>[] = [
          {
            label: "Editar",
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => openEditDialog(row.original),
            disabled: isBusy,
          },
          {
            label: "Eliminar",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => openDeleteDialog(row.original),
            disabled: isBusy,
            variant: "destructive",
          },
        ];

        return <TableActionsCell row={row.original} actions={actions} />;
      },
    },
  ];

  const config = {
    title: "Tipos de Producto",
    description: `${tipoProductos.length} tipos de producto registrados`,
    addAction: {
      label: "Agregar tipo de producto",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (tipoProducto: TipoProductoDTO) => openDeleteDialog(tipoProducto),
    getRowId: (tipoProducto: TipoProductoDTO) => tipoProducto.id,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle =
    dialogMode === "edit"
      ? "Editar tipo de producto"
      : "Nuevo tipo de producto";
  const dialogDescription =
    dialogMode === "edit"
      ? "Actualiza la información del tipo de producto seleccionado."
      : "Ingresa los datos del nuevo tipo de producto.";

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
                <Label htmlFor="tipo-producto-nombre">Nombre *</Label>
                <Input
                  id="tipo-producto-nombre"
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
              <Label htmlFor="tipo-producto-descripcion">Descripción</Label>
              <Textarea
                id="tipo-producto-descripcion"
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
            <AlertDialogTitle>Eliminar tipo de producto</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar el tipo de producto ${deleteTarget.nombre}? Esta acción no se puede deshacer.`
                : "¿Seguro que deseas eliminar este tipo de producto?"}
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

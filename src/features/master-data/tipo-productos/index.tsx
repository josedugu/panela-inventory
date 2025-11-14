"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TipoProductoDTO } from "@/data/repositories/shared.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteTipoProductoAction,
  upsertTipoProductoAction,
} from "@/features/master-data/actions/tipo-producto.actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";
import { getTipoProductoColumns } from "@/features/master-data/tipo-productos/columns";
import {
  type TipoProductoFormValues,
  tipoProductoFormSchema,
} from "@/features/master-data/tipo-productos/schemas";

interface TipoProductosSectionProps {
  tipoProductos: TipoProductoDTO[];
  onRefresh: () => void;
}

type DialogMode = "create" | "edit" | null;

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
  const [editingTipoProducto, setEditingTipoProducto] =
    useState<TipoProductoDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TipoProductoDTO | null>(
    null,
  );
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const form = useForm<TipoProductoFormValues>({
    resolver: zodResolver(tipoProductoFormSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  });

  const openCreateDialog = () => {
    form.reset({
      nombre: "",
      descripcion: "",
    });
    setEditingTipoProducto(null);
    setDialogMode("create");
  };

  const openEditDialog = (tipoProducto: TipoProductoDTO) => {
    form.reset({
      nombre: tipoProducto.nombre,
      descripcion: tipoProducto.descripcion ?? "",
    });
    setEditingTipoProducto(tipoProducto);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingTipoProducto(null);
    form.reset();
  };

  const openDeleteDialog = (tipoProducto: TipoProductoDTO) => {
    setDeleteTarget(tipoProducto);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const onSubmit = (data: TipoProductoFormValues) => {
    if (isSubmitting) return;

    const payload = {
      id: editingTipoProducto?.id,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim()
        ? data.descripcion.trim()
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

  const columns = getTipoProductoColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
    isBusy,
  });

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
    showIndexColumn: false,
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre del tipo de producto"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Descripción del tipo de producto"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </Form>
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

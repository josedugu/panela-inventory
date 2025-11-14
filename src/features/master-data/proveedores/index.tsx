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
import type { SupplierDTO } from "@/data/repositories/suppliers.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteSupplierAction,
  upsertSupplierAction,
} from "@/features/master-data/actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";
import { getSupplierColumns } from "@/features/master-data/proveedores/columns";
import {
  type SupplierFormValues,
  supplierFormSchema,
} from "@/features/master-data/proveedores/schemas";

interface SuppliersSectionProps {
  suppliers: SupplierDTO[];
  onRefresh: () => void;
}

type DialogMode = "create" | "edit" | null;

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function SuppliersSection({
  suppliers,
  onRefresh,
}: SuppliersSectionProps) {
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
  } = useMasterDataTable<SupplierDTO>({
    items: suppliers,
    filters: FILTER_DESCRIPTORS,
    searchableFields: [
      (supplier) => supplier.nombre,
      (supplier) => supplier.contacto,
      (supplier) => supplier.email,
      (supplier) => supplier.telefono,
      (supplier) => supplier.direccion ?? "",
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingSupplier, setEditingSupplier] = useState<SupplierDTO | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<SupplierDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      nombre: "",
      contacto: "",
      email: "",
      telefono: "",
      direccion: "",
    },
  });

  const openCreateDialog = () => {
    form.reset({
      nombre: "",
      contacto: "",
      email: "",
      telefono: "",
      direccion: "",
    });
    setEditingSupplier(null);
    setDialogMode("create");
  };

  const openEditDialog = (supplier: SupplierDTO) => {
    form.reset({
      nombre: supplier.nombre,
      contacto: supplier.contacto,
      email: supplier.email,
      telefono: supplier.telefono,
      direccion: supplier.direccion ?? "",
    });
    setEditingSupplier(supplier);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingSupplier(null);
    form.reset();
  };

  const openDeleteDialog = (supplier: SupplierDTO) => {
    setDeleteTarget(supplier);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const onSubmit = (data: SupplierFormValues) => {
    if (isSubmitting) return;

    const payload = {
      id: editingSupplier?.id,
      nombre: data.nombre.trim(),
      contacto: data.contacto.trim(),
      email: data.email.trim(),
      telefono: data.telefono.trim(),
      direccion: data.direccion?.trim() ? data.direccion.trim() : undefined,
    };

    startSubmitTransition(async () => {
      const result = await upsertSupplierAction(payload);
      if (!result.success) {
        toast.error(result.error ?? "Error al guardar el proveedor");
        return;
      }

      toast.success(
        editingSupplier
          ? "Proveedor actualizado exitosamente"
          : "Proveedor agregado exitosamente",
      );
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteSupplierAction(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error ?? "Error al eliminar el proveedor");
        return;
      }

      toast.success("Proveedor eliminado exitosamente");
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns = getSupplierColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
    isBusy,
  });

  const config = {
    title: "Proveedores",
    description: `${suppliers.length} proveedores registrados`,
    addAction: {
      label: "Agregar proveedor",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (supplier: SupplierDTO) => openDeleteDialog(supplier),
    getRowId: (supplier: SupplierDTO) => supplier.id,
    showIndexColumn: false,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle =
    dialogMode === "edit" ? "Editar proveedor" : "Nuevo proveedor";
  const dialogDescription =
    dialogMode === "edit"
      ? "Actualiza la información del proveedor seleccionado."
      : "Ingresa los datos del nuevo proveedor.";

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
                          placeholder="Nombre del proveedor"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Persona de contacto *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre del contacto"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@ejemplo.com"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Teléfono de contacto"
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
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Dirección del proveedor"
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
            <AlertDialogTitle>Eliminar proveedor</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar a ${deleteTarget.nombre}? Esta acción no se puede deshacer.`
                : "¿Seguro que deseas eliminar este proveedor?"}
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

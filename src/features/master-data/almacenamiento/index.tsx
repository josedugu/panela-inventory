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
import type { StorageDTO } from "@/data/repositories/shared.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteStorageAction,
  upsertStorageAction,
} from "@/features/master-data/actions";
import { getStorageColumns } from "@/features/master-data/almacenamiento/columns";
import {
  type StorageFormValues,
  storageFormSchema,
} from "@/features/master-data/almacenamiento/schemas";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface StorageSectionProps {
  storageOptions: StorageDTO[];
  onRefresh: () => void;
}

type DialogMode = "create" | "edit" | null;

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
    searchableFields: [(option) => option.capacidad.toString()],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingOption, setEditingOption] = useState<StorageDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StorageDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const form = useForm<StorageFormValues>({
    resolver: zodResolver(storageFormSchema),
    defaultValues: {
      capacidad: "",
    },
  });

  const openCreateDialog = () => {
    form.reset({
      capacidad: "",
    });
    setEditingOption(null);
    setDialogMode("create");
  };

  const openEditDialog = (option: StorageDTO) => {
    form.reset({
      capacidad: option.capacidad.toString(),
    });
    setEditingOption(option);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingOption(null);
    form.reset();
  };

  const openDeleteDialog = (option: StorageDTO) => {
    setDeleteTarget(option);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const onSubmit = (data: StorageFormValues) => {
    if (isSubmitting) return;

    const capacidadNumber = Number.parseInt(data.capacidad.trim(), 10);

    const payload = {
      id: editingOption?.id,
      capacidad: capacidadNumber,
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

  const columns = getStorageColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
    isBusy,
  });

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="capacidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad (GB) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Ej: 128"
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

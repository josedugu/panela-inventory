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
import type { BrandDTO } from "@/data/repositories/shared.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteBrandAction,
  upsertBrandAction,
} from "@/features/master-data/actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";
import { getBrandColumns } from "@/features/master-data/marcas/columns";
import {
  type BrandFormValues,
  brandFormSchema,
} from "@/features/master-data/marcas/schemas";

interface BrandsSectionProps {
  brands: BrandDTO[];
  onRefresh: () => void;
}

type DialogMode = "create" | "edit" | null;

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
      (brand) => brand.descripcion ?? "",
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingBrand, setEditingBrand] = useState<BrandDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
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
    setEditingBrand(null);
    setDialogMode("create");
  };

  const openEditDialog = (brand: BrandDTO) => {
    form.reset({
      nombre: brand.nombre,
      descripcion: brand.descripcion ?? "",
    });
    setEditingBrand(brand);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingBrand(null);
    form.reset();
  };

  const openDeleteDialog = (brand: BrandDTO) => {
    setDeleteTarget(brand);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const onSubmit = (data: BrandFormValues) => {
    if (isSubmitting) return;

    const payload = {
      id: editingBrand?.id,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim()
        ? data.descripcion.trim()
        : undefined,
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

  const columns = getBrandColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
    isBusy,
  });

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
    showIndexColumn: false,
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
                          placeholder="Nombre de la marca"
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
                        placeholder="Descripción de la marca"
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

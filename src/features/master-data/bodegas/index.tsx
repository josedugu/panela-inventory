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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CostCenterDTO } from "@/data/repositories/shared.repository";
import type { WarehouseDTO } from "@/data/repositories/warehouses.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteWarehouseAction,
  upsertWarehouseAction,
} from "@/features/master-data/actions";
import { getWarehouseColumns } from "@/features/master-data/bodegas/columns";
import {
  type WarehouseFormValues,
  warehouseFormSchema,
} from "@/features/master-data/bodegas/schemas";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface WarehousesSectionProps {
  warehouses: WarehouseDTO[];
  costCenters: CostCenterDTO[];
  onRefresh: () => void;
}

type DialogMode = "create" | "edit" | null;

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function WarehousesSection({
  warehouses,
  costCenters,
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
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseDTO | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<WarehouseDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      centroCostoId: "",
    },
  });

  const openCreateDialog = () => {
    form.reset({
      codigo: "",
      nombre: "",
      centroCostoId: "",
    });
    setEditingWarehouse(null);
    setDialogMode("create");
  };

  const openEditDialog = (warehouse: WarehouseDTO) => {
    form.reset({
      codigo: warehouse.codigo,
      nombre: warehouse.nombre,
      centroCostoId: warehouse.centroCostoId ?? "",
    });
    setEditingWarehouse(warehouse);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingWarehouse(null);
    form.reset();
  };

  const openDeleteDialog = (warehouse: WarehouseDTO) => {
    setDeleteTarget(warehouse);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const onSubmit = (data: WarehouseFormValues) => {
    if (isSubmitting) return;

    const payload = {
      id: editingWarehouse?.id,
      codigo: data.codigo.trim(),
      nombre: data.nombre.trim(),
      centroCostoId: data.centroCostoId || undefined,
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

  const columns = getWarehouseColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
    isBusy,
  });

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Código de la bodega"
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
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre de la bodega"
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
                  name="centroCostoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Centro de Costo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin centro asignado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Sin centro asignado</SelectItem>
                          {costCenters.map((center) => (
                            <SelectItem key={center.id} value={center.id}>
                              {center.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
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

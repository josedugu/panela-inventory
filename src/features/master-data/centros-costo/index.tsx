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
import type { CostCenterDTO } from "@/data/repositories/shared.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteCostCenterAction,
  upsertCostCenterAction,
} from "@/features/master-data/actions";
import { getCostCenterColumns } from "@/features/master-data/centros-costo/columns";
import {
  type CostCenterFormValues,
  costCenterFormSchema,
} from "@/features/master-data/centros-costo/schemas";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface CostCentersSectionProps {
  costCenters: CostCenterDTO[];
  onRefresh: () => void;
}

type DialogMode = "create" | "edit" | null;

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
      (center) => center.responsable ?? "",
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingCenter, setEditingCenter] = useState<CostCenterDTO | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<CostCenterDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const form = useForm<CostCenterFormValues>({
    resolver: zodResolver(costCenterFormSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      responsable: "",
    },
  });

  const openCreateDialog = () => {
    form.reset({
      nombre: "",
      descripcion: "",
      responsable: "",
    });
    setEditingCenter(null);
    setDialogMode("create");
  };

  const openEditDialog = (center: CostCenterDTO) => {
    form.reset({
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
    form.reset();
  };

  const openDeleteDialog = (center: CostCenterDTO) => {
    setDeleteTarget(center);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const onSubmit = (data: CostCenterFormValues) => {
    if (isSubmitting) return;

    const payload = {
      id: editingCenter?.id,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim()
        ? data.descripcion.trim()
        : undefined,
      responsable: data.responsable?.trim()
        ? data.responsable.trim()
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

  const columns = getCostCenterColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
    isBusy,
  });

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
    showIndexColumn: false,
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
                          placeholder="Nombre del centro de costo"
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
                        placeholder="Descripción del centro de costo"
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
                name="responsable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre del responsable"
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

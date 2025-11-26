"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useState, useTransition } from "react";
import {
  type DefaultValues,
  type FieldValues,
  type Path,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

// Helper para campos select
export function SelectFormField<T extends Record<string, unknown>>({
  form,
  name,
  label,
  options,
  placeholder = "Selecciona una opción",
  required = false,
}: {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <FormField
      control={form.control}
      name={name as Path<T>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required ? " *" : ""}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={String(field.value ?? "")}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export interface CrudSectionConfig<TData, TFormValues extends FieldValues> {
  // Configuración básica
  title: string;
  entityName: string;
  getItemId: (item: TData) => string;
  getItemName: (item: TData) => string;

  // Tabla
  columns: (options: {
    onEdit: (item: TData) => void;
    onDelete: (item: TData) => void;
    isBusy?: boolean;
  }) => ColumnDef<TData>[];
  filters?: EntityFilterDescriptor[];
  searchableFields?: Array<(item: TData) => string>;

  // Relaciones/Selects (opcional)
  selectFields?: {
    [fieldName: string]: {
      options: Array<{ value: string; label: string }>;
      placeholder?: string;
    };
  };

  // Formulario
  // Usamos z.ZodTypeAny debido a limitaciones de compatibilidad de tipos
  // entre zodResolver y tipos genéricos. En runtime funciona correctamente.
  formSchema: z.ZodTypeAny;
  defaultFormValues: TFormValues;
  getFormValuesForEdit?: (item: TData) => TFormValues;

  // Acciones
  upsertAction: (
    data: TFormValues & { id?: string },
  ) => Promise<ActionResponse>;
  deleteAction: (id: string) => Promise<ActionResponse>;

  // Mensajes
  successMessages: {
    create: string;
    update: string;
    delete: string;
  };
  errorMessages: {
    create: string;
    update: string;
    delete: string;
  };
}

export interface CrudSectionProps<TData, TFormValues extends FieldValues> {
  items: TData[];
  config: CrudSectionConfig<TData, TFormValues>;
  onRefresh: () => void;
  renderForm: (
    form: UseFormReturn<TFormValues>,
    selectOptions?: {
      [fieldName: string]: {
        options: Array<{ value: string; label: string }>;
        placeholder?: string;
      };
    },
  ) => React.ReactNode;
}

export interface ActionResponse {
  success: boolean;
  error?: string;
}

type DialogMode = "create" | "edit" | null;

export function CrudSection<TData, TFormValues extends FieldValues>({
  items,
  config,
  onRefresh,
  renderForm,
}: CrudSectionProps<TData, TFormValues>) {
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
  } = useMasterDataTable<TData>({
    items,
    filters: config.filters ?? [],
    searchableFields: config.searchableFields ?? [],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingItem, setEditingItem] = useState<TData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TData | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const form = useForm<TFormValues>({
    resolver: zodResolver(config.formSchema),
    defaultValues: config.defaultFormValues as DefaultValues<TFormValues>,
  });

  const openCreateDialog = () => {
    form.reset(config.defaultFormValues);
    setEditingItem(null);
    setDialogMode("create");
  };

  const openEditDialog = (item: TData) => {
    const formValues = config.getFormValuesForEdit
      ? config.getFormValuesForEdit(item)
      : config.defaultFormValues;
    form.reset(formValues);
    setEditingItem(item);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingItem(null);
    form.reset();
  };

  const openDeleteDialog = (item: TData) => {
    setDeleteTarget(item);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const onSubmit = (data: TFormValues) => {
    if (isSubmitting) return;

    const payload = {
      id: editingItem ? config.getItemId(editingItem) : undefined,
      ...data,
    };

    startSubmitTransition(async () => {
      const result = await config.upsertAction(payload);
      if (!result.success) {
        const errorMessage = editingItem
          ? config.errorMessages.update
          : config.errorMessages.create;
        toast.error(result.error ?? errorMessage);
        return;
      }

      const successMessage = editingItem
        ? config.successMessages.update
        : config.successMessages.create;
      toast.success(successMessage);
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await config.deleteAction(config.getItemId(deleteTarget));
      if (!result.success) {
        toast.error(result.error ?? config.errorMessages.delete);
        return;
      }

      toast.success(config.successMessages.delete);
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns = config.columns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
    isBusy,
  });

  const tableConfig = {
    title: config.title,
    description: `${items.length} ${config.entityName}${items.length !== 1 ? "s" : ""} registrada${items.length !== 1 ? "s" : ""}`,
    addAction: {
      label: `Agregar ${config.entityName}`,
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (item: TData) => openDeleteDialog(item),
    getRowId: config.getItemId,
    showIndexColumn: false,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle =
    dialogMode === "edit"
      ? `Editar ${config.entityName}`
      : `Nueva ${config.entityName}`;
  const dialogDescription =
    dialogMode === "edit"
      ? `Actualiza la información de la ${config.entityName} seleccionada.`
      : `Ingresa los datos de la nueva ${config.entityName}.`;

  return (
    <>
      <EntityTableLayout
        config={tableConfig}
        data={data}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        searchValue={search}
        onSearchChange={setSearch}
        filters={config.filters ?? []}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                {renderForm(form, config.selectFields)}
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
          if (!open) {
            closeDeleteDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar {config.entityName}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar la ${config.entityName} ${config.getItemName(deleteTarget)}? Esta acción no se puede deshacer.`
                : `¿Seguro que deseas eliminar esta ${config.entityName}?`}
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

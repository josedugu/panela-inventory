"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useState,
  useTransition,
} from "react";
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
import { cn } from "@/components/ui/utils";
import type { ColorDTO } from "@/data/repositories/master-data.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteColorAction,
  upsertColorAction,
} from "@/features/master-data/actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface ColorsSectionProps {
  colors: ColorDTO[];
  onRefresh: () => void;
}

interface ColorFormState {
  nombre: string;
  codigoHex: string;
  descripcion: string;
  estado: "activo" | "inactivo";
}

type DialogMode = "create" | "edit" | null;

const createEmptyFormState = (): ColorFormState => ({
  nombre: "",
  codigoHex: "#000000",
  descripcion: "",
  estado: "activo",
});

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function ColorsSection({ colors, onRefresh }: ColorsSectionProps) {
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
  } = useMasterDataTable<ColorDTO>({
    items: colors,
    filters: FILTER_DESCRIPTORS,
    searchableFields: [
      (color) => color.nombre,
      (color) => color.codigoHex,
      (color) => color.descripcion ?? "",
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<ColorFormState>(
    createEmptyFormState(),
  );
  const [editingColor, setEditingColor] = useState<ColorDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ColorDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const openCreateDialog = () => {
    setFormData(createEmptyFormState());
    setEditingColor(null);
    setDialogMode("create");
  };

  const openEditDialog = (color: ColorDTO) => {
    setFormData({
      nombre: color.nombre,
      codigoHex: color.codigoHex,
      descripcion: color.descripcion ?? "",
      estado: color.estado ? "activo" : "inactivo",
    });
    setEditingColor(color);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingColor(null);
    setFormData(createEmptyFormState());
  };

  const openDeleteDialog = (color: ColorDTO) => {
    setDeleteTarget(color);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleFormChange = (field: keyof ColorFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFormChange("codigoHex", event.target.value);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const payload = {
      id: editingColor?.id,
      nombre: formData.nombre.trim(),
      codigoHex: formData.codigoHex.trim(),
      descripcion: formData.descripcion.trim()
        ? formData.descripcion.trim()
        : undefined,
      estado: formData.estado === "activo",
    };

    startSubmitTransition(async () => {
      const result = await upsertColorAction(payload);
      if (!result.success) {
        toast.error(result.error ?? "Error al guardar el color");
        return;
      }

      toast.success(
        editingColor
          ? "Color actualizado exitosamente"
          : "Color agregado exitosamente",
      );
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteColorAction(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error ?? "Error al eliminar el color");
        return;
      }

      toast.success("Color eliminado exitosamente");
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns: ColumnDef<ColorDTO>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "codigoHex",
      header: "Código HEX",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-2 font-mono">
          <span
            className="h-4 w-4 rounded-full border border-border"
            style={{ backgroundColor: row.original.codigoHex }}
          />
          {row.original.codigoHex}
        </span>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => row.original.descripcion ?? "—",
    },
    {
      id: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.original.estado;
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
              isActive
                ? "bg-success-light text-success-foreground"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {isActive ? "Activo" : "Inactivo"}
          </span>
        );
      },
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
    title: "Colores",
    description: `${colors.length} colores registrados`,
    addAction: {
      label: "Agregar color",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (color: ColorDTO) => openDeleteDialog(color),
    getRowId: (color: ColorDTO) => color.id,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle = dialogMode === "edit" ? "Editar color" : "Nuevo color";
  const dialogDescription =
    dialogMode === "edit"
      ? "Actualiza la información del color seleccionado."
      : "Ingresa los datos del nuevo color.";

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
                <Label htmlFor="color-nombre">Nombre *</Label>
                <Input
                  id="color-nombre"
                  value={formData.nombre}
                  onChange={(event) =>
                    handleFormChange("nombre", event.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color-codigo">Código HEX *</Label>
                <Input
                  id="color-codigo"
                  type="color"
                  value={formData.codigoHex}
                  onChange={handleColorChange}
                  className="h-10 w-full cursor-pointer"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color-descripcion">Descripción</Label>
              <Textarea
                id="color-descripcion"
                rows={3}
                value={formData.descripcion}
                onChange={(event) =>
                  handleFormChange("descripcion", event.target.value)
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color-estado">Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleFormChange("estado", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="color-estado">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
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
            <AlertDialogTitle>Eliminar color</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar el color ${deleteTarget.nombre}? Esta acción no se puede deshacer.`
                : "¿Seguro que deseas eliminar este color?"}
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

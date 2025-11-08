"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState, useTransition } from "react";
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
  InputSearch,
  type InputSearchOption,
} from "@/components/ui/input-search";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductDTO } from "@/data/repositories/master.products.repository";
import type {
  BrandDTO,
  ColorDTO,
  ModelDTO,
  RamDTO,
  StorageDTO,
  TipoProductoDTO,
} from "@/data/repositories/shared.repository";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteProductAction,
  upsertProductAction,
} from "@/features/master-data/actions";
import { useMasterDataTable } from "@/features/master-data/hooks/useMasterDataTable";

interface ProductsSectionProps {
  products: ProductDTO[];
  tipoProductos: TipoProductoDTO[];
  brands: BrandDTO[];
  models: ModelDTO[];
  storageOptions: StorageDTO[];
  ramOptions: RamDTO[];
  colors: ColorDTO[];
  onRefresh: () => void;
}

interface ProductFormState {
  tipoProductoId: string;
  marcaId: string;
  modeloId: string;
  almacenamientoId: string;
  ramId: string;
  colorId: string;
}

type DialogMode = "create" | "edit" | null;

const createEmptyFormState = (): ProductFormState => ({
  tipoProductoId: "",
  marcaId: "",
  modeloId: "",
  almacenamientoId: "",
  ramId: "",
  colorId: "",
});

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [];

export function ProductsSection({
  products,
  tipoProductos,
  brands,
  models,
  storageOptions,
  ramOptions,
  colors,
  onRefresh,
}: ProductsSectionProps) {
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
  } = useMasterDataTable<ProductDTO>({
    items: products,
    filters: FILTER_DESCRIPTORS,
    searchableFields: [
      (product) => product.tipoProductoNombre ?? "",
      (product) => product.marcaNombre ?? "",
      (product) => product.modeloNombre ?? "",
      (product) =>
        product.almacenamientoCapacidad
          ? product.almacenamientoCapacidad.toString()
          : "",
      (product) =>
        product.ramCapacidad ? product.ramCapacidad.toString() : "",
      (product) => product.colorNombre ?? "",
      (product) => (product.costo ? product.costo.toString() : ""),
    ],
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<ProductFormState>(
    createEmptyFormState(),
  );
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // Preparar opciones para InputSearch
  const brandOptions: InputSearchOption[] = useMemo(
    () =>
      brands.map((brand) => ({
        label: brand.nombre,
        value: brand.id,
      })),
    [brands],
  );

  // Filtrar modelos según la marca seleccionada
  const availableModels = useMemo(() => {
    if (!formData.marcaId) return [];
    return models.filter((model) => model.marcaId === formData.marcaId);
  }, [models, formData.marcaId]);

  const modelOptions: InputSearchOption[] = useMemo(
    () =>
      availableModels.map((model) => ({
        label: model.nombre,
        value: model.id,
      })),
    [availableModels],
  );

  // Resetear modeloId si cambia la marca
  const handleMarcaChange = (option: InputSearchOption | undefined) => {
    setFormData((prev) => ({
      ...prev,
      marcaId: option?.value ?? "",
      modeloId: "", // Resetear modelo cuando cambia la marca
    }));
  };

  const handleModeloChange = (option: InputSearchOption | undefined) => {
    setFormData((prev) => ({
      ...prev,
      modeloId: option?.value ?? "",
    }));
  };

  const openCreateDialog = () => {
    setFormData(createEmptyFormState());
    setEditingProduct(null);
    setDialogMode("create");
  };

  const openEditDialog = (product: ProductDTO) => {
    setFormData({
      tipoProductoId: product.tipoProductoId ?? "",
      marcaId: product.marcaId ?? "",
      modeloId: product.modeloId ?? "",
      almacenamientoId: product.almacenamientoId ?? "",
      ramId: product.ramId ?? "",
      colorId: product.colorId ?? "",
    });
    setEditingProduct(product);
    setDialogMode("edit");
  };

  // Obtener valores seleccionados para InputSearch
  const selectedBrand: InputSearchOption | undefined = useMemo(() => {
    if (!formData.marcaId) return undefined;
    const brand = brands.find((b) => b.id === formData.marcaId);
    return brand ? { label: brand.nombre, value: brand.id } : undefined;
  }, [formData.marcaId, brands]);

  const selectedModel: InputSearchOption | undefined = useMemo(() => {
    if (!formData.modeloId) return undefined;
    const model = availableModels.find((m) => m.id === formData.modeloId);
    return model ? { label: model.nombre, value: model.id } : undefined;
  }, [formData.modeloId, availableModels]);

  const closeDialog = () => {
    setDialogMode(null);
    setEditingProduct(null);
    setFormData(createEmptyFormState());
  };

  const openDeleteDialog = (product: ProductDTO) => {
    setDeleteTarget(product);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleFormChange = (field: keyof ProductFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    // Validar campos obligatorios
    if (!formData.tipoProductoId.trim()) {
      toast.error("El tipo de producto es obligatorio");
      return;
    }
    if (!formData.marcaId.trim()) {
      toast.error("La marca es obligatoria");
      return;
    }
    if (!formData.modeloId.trim()) {
      toast.error("El modelo es obligatorio");
      return;
    }
    if (!formData.almacenamientoId.trim()) {
      toast.error("El almacenamiento es obligatorio");
      return;
    }
    if (!formData.ramId.trim()) {
      toast.error("La RAM es obligatoria");
      return;
    }
    if (!formData.colorId.trim()) {
      toast.error("El color es obligatorio");
      return;
    }

    const payload = {
      id: editingProduct?.id,
      tipoProductoId: formData.tipoProductoId.trim(),
      marcaId: formData.marcaId.trim(),
      modeloId: formData.modeloId.trim(),
      almacenamientoId: formData.almacenamientoId.trim(),
      ramId: formData.ramId.trim(),
      colorId: formData.colorId.trim(),
    };

    startSubmitTransition(async () => {
      const result = await upsertProductAction(payload);
      if (!result.success) {
        toast.error(result.error ?? "Error al guardar el producto");
        return;
      }

      toast.success(
        editingProduct
          ? "Producto actualizado exitosamente"
          : "Producto agregado exitosamente",
      );
      closeDialog();
      onRefresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteProductAction(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error ?? "Error al eliminar el producto");
        return;
      }

      toast.success("Producto eliminado exitosamente");
      closeDeleteDialog();
      onRefresh();
    });
  };

  const isBusy = isSubmitting || isDeleting;

  const columns: ColumnDef<ProductDTO>[] = [
    {
      accessorKey: "tipoProductoNombre",
      header: "Tipo",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.tipoProductoNombre ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "marcaNombre",
      header: "Marca",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.marcaNombre ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "modeloNombre",
      header: "Modelo",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.modeloNombre ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "costo",
      header: "Costo",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.costo
            ? `$${row.original.costo.toLocaleString("es-CO")}`
            : "—"}
        </div>
      ),
    },
    {
      accessorKey: "cantidad",
      header: "Cantidad",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.cantidad}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
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
    title: "Productos",
    description: `${products.length} productos registrados`,
    addAction: {
      label: "Agregar producto",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (product: ProductDTO) => openDeleteDialog(product),
    getRowId: (product: ProductDTO) => product.id,
  };

  const isDialogOpen = dialogMode !== null;
  const dialogTitle =
    dialogMode === "edit" ? "Editar producto" : "Nuevo producto";
  const dialogDescription =
    dialogMode === "edit"
      ? "Actualiza la información del producto seleccionado."
      : "Ingresa los datos del nuevo producto.";

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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-tipo">Tipo de Producto *</Label>
                <Select
                  value={formData.tipoProductoId}
                  onValueChange={(value) =>
                    handleFormChange("tipoProductoId", value)
                  }
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger id="product-tipo">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoProductos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <InputSearch
                  label="Marca *"
                  placeholder="Buscar marca..."
                  value={selectedBrand}
                  onChange={handleMarcaChange}
                  options={brandOptions}
                  disabled={isSubmitting}
                  maxOptions={10}
                />
              </div>
              <div className="space-y-2">
                <InputSearch
                  label="Modelo *"
                  placeholder="Buscar modelo..."
                  value={selectedModel}
                  onChange={handleModeloChange}
                  options={modelOptions}
                  disabled={isSubmitting || !formData.marcaId}
                  maxOptions={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-almacenamiento">Almacenamiento *</Label>
                <Select
                  value={formData.almacenamientoId}
                  onValueChange={(value) =>
                    handleFormChange("almacenamientoId", value)
                  }
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger id="product-almacenamiento">
                    <SelectValue placeholder="Selecciona almacenamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {storageOptions.map((storage) => (
                      <SelectItem key={storage.id} value={storage.id}>
                        {storage.capacidad} GB
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-ram">RAM *</Label>
                <Select
                  value={formData.ramId}
                  onValueChange={(value) => handleFormChange("ramId", value)}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger id="product-ram">
                    <SelectValue placeholder="Selecciona RAM" />
                  </SelectTrigger>
                  <SelectContent>
                    {ramOptions.map((ram) => (
                      <SelectItem key={ram.id} value={ram.id}>
                        {ram.capacidad} GB
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-color">Color *</Label>
                <Select
                  value={formData.colorId}
                  onValueChange={(value) => handleFormChange("colorId", value)}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger id="product-color">
                    <SelectValue placeholder="Selecciona un color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        {color.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.`
                : "¿Seguro que deseas eliminar este producto?"}
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

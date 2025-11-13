"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  InputSearch,
  type InputSearchOption,
} from "@/components/ui/input-search";
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

const productFormSchema = z.object({
  tipoProductoId: z.string().uuid("Selecciona un tipo de producto válido"),
  marcaId: z.string().uuid("Selecciona una marca válida"),
  modeloId: z.string().uuid("Selecciona un modelo válido"),
  almacenamientoId: z.string().uuid("Selecciona un almacenamiento válido"),
  ramId: z.string().uuid("Selecciona una RAM válida"),
  colorId: z.string().uuid("Selecciona un color válido"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

type DialogMode = "create" | "edit" | null;

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
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductDTO | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      tipoProductoId: "",
      marcaId: "",
      modeloId: "",
      almacenamientoId: "",
      ramId: "",
      colorId: "",
    },
  });

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
  const marcaId = form.watch("marcaId");
  const availableModels = useMemo(() => {
    if (!marcaId) return [];
    return models.filter((model) => model.marcaId === marcaId);
  }, [models, marcaId]);

  const modelOptions: InputSearchOption[] = useMemo(
    () =>
      availableModels.map((model) => ({
        label: model.nombre,
        value: model.id,
      })),
    [availableModels],
  );

  // Obtener valores seleccionados para InputSearch
  const selectedBrand: InputSearchOption | undefined = useMemo(() => {
    if (!marcaId) return undefined;
    const brand = brands.find((b) => b.id === marcaId);
    return brand ? { label: brand.nombre, value: brand.id } : undefined;
  }, [marcaId, brands]);

  const modeloId = form.watch("modeloId");
  const selectedModel: InputSearchOption | undefined = useMemo(() => {
    if (!modeloId) return undefined;
    const model = availableModels.find((m) => m.id === modeloId);
    return model ? { label: model.nombre, value: model.id } : undefined;
  }, [modeloId, availableModels]);

  const openCreateDialog = () => {
    form.reset({
      tipoProductoId: "",
      marcaId: "",
      modeloId: "",
      almacenamientoId: "",
      ramId: "",
      colorId: "",
    });
    setEditingProduct(null);
    setDialogMode("create");
  };

  const openEditDialog = (product: ProductDTO) => {
    form.reset({
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

  const closeDialog = () => {
    setDialogMode(null);
    setEditingProduct(null);
    form.reset();
  };

  const openDeleteDialog = (product: ProductDTO) => {
    setDeleteTarget(product);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  // Resetear modeloId cuando cambia la marca
  const handleMarcaChange = (option: InputSearchOption | undefined) => {
    form.setValue("marcaId", option?.value ?? "");
    form.setValue("modeloId", ""); // Resetear modelo cuando cambia la marca
  };

  const onSubmit = (data: ProductFormValues) => {
    if (isSubmitting) return;

    const payload = {
      id: editingProduct?.id,
      tipoProductoId: data.tipoProductoId,
      marcaId: data.marcaId,
      modeloId: data.modeloId,
      almacenamientoId: data.almacenamientoId,
      ramId: data.ramId,
      colorId: data.colorId,
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tipoProductoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Producto *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tipoProductos.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marcaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <FormControl>
                        <InputSearch
                          placeholder="Buscar marca..."
                          value={selectedBrand}
                          onChange={(option) => {
                            handleMarcaChange(option);
                            field.onChange(option?.value ?? "");
                          }}
                          options={brandOptions}
                          disabled={isSubmitting}
                          maxOptions={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modeloId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo *</FormLabel>
                      <FormControl>
                        <InputSearch
                          placeholder="Buscar modelo..."
                          value={selectedModel}
                          onChange={(option) => {
                            field.onChange(option?.value ?? "");
                          }}
                          options={modelOptions}
                          disabled={isSubmitting || !marcaId}
                          maxOptions={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="almacenamientoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Almacenamiento *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona almacenamiento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {storageOptions.map((storage) => (
                            <SelectItem key={storage.id} value={storage.id}>
                              {storage.capacidad} GB
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ramId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RAM *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona RAM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ramOptions.map((ram) => (
                            <SelectItem key={ram.id} value={ram.id}>
                              {ram.capacidad} GB
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="colorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color.id} value={color.id}>
                              {color.nombre}
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

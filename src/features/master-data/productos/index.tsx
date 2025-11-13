"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useTransition } from "react";
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
import { CurrencyInput } from "@/components/ui/currency-input";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { getProductColumns } from "@/features/master-data/productos/columns";
import {
  type ProductFormValues,
  productFormSchema,
} from "@/features/master-data/productos/schemas";

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
      pvp: "",
      descripcion: "",
      estado: true,
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
      pvp: "",
      descripcion: "",
      estado: true,
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
      pvp: product.pvp?.toString() ?? "",
      descripcion: product.descripcion ?? "",
      estado: product.estado ?? true,
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

    const pvpNumber =
      data.pvp && data.pvp !== "" ? Number.parseFloat(data.pvp) : undefined;

    const payload = {
      id: editingProduct?.id,
      tipoProductoId: data.tipoProductoId,
      marcaId: data.marcaId,
      modeloId: data.modeloId,
      almacenamientoId: data.almacenamientoId,
      ramId: data.ramId,
      colorId: data.colorId,
      pvp: !Number.isNaN(pvpNumber) ? pvpNumber : undefined,
      descripcion: data.descripcion,
      estado: data.estado,
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

  const columns = getProductColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
    isBusy,
  });

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
              <FormField
                control={form.control}
                name="pvp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Venta al Público (PVP)</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="Ingresa el precio de venta"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ingresa una descripción del producto"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Estado</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        El producto estará activo o inactivo
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
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

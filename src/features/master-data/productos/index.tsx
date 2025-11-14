"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
import { MultiSelectSearch } from "@/components/ui/multi-select-search";
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
import { useEntityFilters } from "@/features/entity-table/hooks/use-entity-filters";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  deleteProductAction,
  getProductFilterOptionsAction,
  getProductsWithFiltersAction,
  upsertProductAction,
} from "@/features/master-data/actions";
import { getProductColumns } from "@/features/master-data/productos/columns";
import {
  type ProductFormValues,
  productFormSchema,
} from "@/features/master-data/productos/schemas";

interface ProductsSectionProps {
  tipoProductos: TipoProductoDTO[];
  brands: BrandDTO[];
  models: ModelDTO[];
  storageOptions: StorageDTO[];
  ramOptions: RamDTO[];
  colors: ColorDTO[];
  onRefresh: () => void;
}

type DialogMode = "create" | "edit" | null;

const FILTER_DESCRIPTORS: EntityFilterDescriptor[] = [
  {
    key: "nombre",
    label: "Nombre",
    type: "input-search",
  },
  {
    key: "marca",
    label: "Marca",
    type: "input-search",
  },
  {
    key: "modelo",
    label: "Modelo",
    type: "input-search",
  },
  {
    key: "estado",
    label: "Estado",
    type: "input-search",
    options: [
      { value: "activo", label: "Activo" },
      { value: "inactivo", label: "Inactivo" },
    ],
  },
];

export function ProductsSection({
  tipoProductos,
  brands,
  models,
  storageOptions,
  ramOptions,
  colors,
  onRefresh,
}: ProductsSectionProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    filterState,
    setFilterState,
    pendingFilterState,
    setPendingFilterState,
    applyFilters,
    resetPendingFilters,
    clearFilters,
    filtersKey,
    isDialogOpen,
    setDialogOpen,
    normalizedOptions,
  } = useEntityFilters({
    filters: FILTER_DESCRIPTORS,
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["products", filtersKey, page, pageSize],
    queryFn: async () => {
      const filters: Record<string, string> = {};
      if (filterState.nombre) filters.nombre = filterState.nombre as string;
      if (filterState.marca) filters.marca = filterState.marca as string;
      if (filterState.modelo) filters.modelo = filterState.modelo as string;
      if (filterState.estado) filters.estado = filterState.estado as string;

      const result = await getProductsWithFiltersAction(
        Object.keys(filters).length > 0 ? filters : undefined,
        page,
        pageSize,
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: filterOptions, isLoading: isLoadingFilterOptions } = useQuery({
    queryKey: ["product-filter-options"],
    queryFn: getProductFilterOptionsAction,
    enabled: isDialogOpen,
    staleTime: Infinity,
  });

  const filterOptionsMap = useMemo(() => {
    const base = { ...normalizedOptions } as Record<
      string,
      { label: string; value: string }[]
    >;

    if (filterOptions) {
      base.marca = filterOptions.marcas.map((value) => ({
        label: value,
        value,
      }));
      base.modelo = filterOptions.modelos.map((value) => ({
        label: value,
        value,
      }));
    } else {
      base.marca ??= [];
      base.modelo ??= [];
    }

    // Estado siempre tiene opciones predefinidas
    base.estado = [
      { value: "activo", label: "Activo" },
      { value: "inactivo", label: "Inactivo" },
    ];

    return base;
  }, [filterOptions, normalizedOptions]);

  const isLoadingFilters = isLoadingFilterOptions && !filterOptions;

  // Los datos ya vienen paginados del servidor
  const displayData = data?.data ?? [];
  const displayTotal = data?.total ?? 0;

  const handlePageChange = (nextPage: number) => {
    const totalPages = Math.max(1, Math.ceil(displayTotal / pageSize));
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

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
      almacenamientoIds: [],
      ramIds: [],
      colorIds: [],
      pvp: "",
      descripcion: "",
      estado: true,
    },
  });

  // Observar el tipo de producto seleccionado para determinar si es celular
  const tipoProductoId = form.watch("tipoProductoId");
  const selectedTipoProducto = useMemo(() => {
    if (!tipoProductoId) return null;
    return tipoProductos.find((tipo) => tipo.id === tipoProductoId);
  }, [tipoProductoId, tipoProductos]);

  // Determinar si es celular (comparación case-insensitive)
  const isCelular = useMemo(() => {
    if (!selectedTipoProducto) return false;
    return selectedTipoProducto.nombre.toLowerCase().includes("celular");
  }, [selectedTipoProducto]);

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

  // Preparar opciones para MultiSelectSearch de RAM
  const ramOptionsForMultiSelect: InputSearchOption[] = useMemo(
    () =>
      ramOptions.map((ram) => ({
        label: `${ram.capacidad} GB`,
        value: ram.id,
      })),
    [ramOptions],
  );

  // Obtener valores seleccionados para MultiSelectSearch de RAM
  const ramIds = form.watch("ramIds");
  const selectedRams: InputSearchOption[] = useMemo(() => {
    if (!ramIds || ramIds.length === 0) return [];
    return ramOptionsForMultiSelect.filter((ram) => ramIds.includes(ram.value));
  }, [ramIds, ramOptionsForMultiSelect]);

  // Preparar opciones para MultiSelectSearch de Almacenamiento
  const almacenamientoOptionsForMultiSelect: InputSearchOption[] = useMemo(
    () =>
      storageOptions.map((storage) => ({
        label: `${storage.capacidad} GB`,
        value: storage.id,
      })),
    [storageOptions],
  );

  // Obtener valores seleccionados para MultiSelectSearch de Almacenamiento
  const almacenamientoIds = form.watch("almacenamientoIds");
  const selectedAlmacenamientos: InputSearchOption[] = useMemo(() => {
    if (!almacenamientoIds || almacenamientoIds.length === 0) return [];
    return almacenamientoOptionsForMultiSelect.filter((storage) =>
      almacenamientoIds.includes(storage.value),
    );
  }, [almacenamientoIds, almacenamientoOptionsForMultiSelect]);

  // Preparar opciones para MultiSelectSearch de Color
  const colorOptionsForMultiSelect: InputSearchOption[] = useMemo(
    () =>
      colors.map((color) => ({
        label: color.nombre,
        value: color.id,
      })),
    [colors],
  );

  // Obtener valores seleccionados para MultiSelectSearch de Color
  const colorIds = form.watch("colorIds");
  const selectedColors: InputSearchOption[] = useMemo(() => {
    if (!colorIds || colorIds.length === 0) return [];
    return colorOptionsForMultiSelect.filter((color) =>
      colorIds.includes(color.value),
    );
  }, [colorIds, colorOptionsForMultiSelect]);

  const openCreateDialog = () => {
    form.reset({
      tipoProductoId: "",
      marcaId: "",
      modeloId: "",
      almacenamientoIds: [],
      ramIds: [],
      colorIds: [],
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
      almacenamientoIds: product.almacenamientoId
        ? [product.almacenamientoId]
        : [],
      ramIds: product.ramId ? [product.ramId] : [],
      colorIds: product.colorId ? [product.colorId] : [],
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

  // Resetear campos específicos de celular cuando cambia el tipo de producto
  const handleTipoProductoChange = (value: string) => {
    form.setValue("tipoProductoId", value);
    const selectedTipo = tipoProductos.find((tipo) => tipo.id === value);
    const isCelularTipo =
      selectedTipo?.nombre.toLowerCase().includes("celular") ?? false;

    // Si no es celular, limpiar campos específicos de celular
    if (!isCelularTipo) {
      form.setValue("almacenamientoIds", []);
      form.setValue("ramIds", []);
      form.setValue("colorIds", []);
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    if (isSubmitting) return;

    // Validación condicional: si es celular, los campos deben estar presentes
    if (isCelular) {
      if (!data.modeloId) {
        form.setError("modeloId", {
          type: "manual",
          message: "El modelo es obligatorio para celulares",
        });
        return;
      }
      if (!data.almacenamientoIds || data.almacenamientoIds.length === 0) {
        form.setError("almacenamientoIds", {
          type: "manual",
          message: "Selecciona al menos un almacenamiento para celulares",
        });
        return;
      }
      if (!data.ramIds || data.ramIds.length === 0) {
        form.setError("ramIds", {
          type: "manual",
          message: "Selecciona al menos una RAM para celulares",
        });
        return;
      }
      if (!data.colorIds || data.colorIds.length === 0) {
        form.setError("colorIds", {
          type: "manual",
          message: "Selecciona al menos un color para celulares",
        });
        return;
      }
    }

    const pvpNumber =
      data.pvp && data.pvp !== "" ? Number.parseFloat(data.pvp) : undefined;

    const payload = {
      id: editingProduct?.id,
      tipoProductoId: data.tipoProductoId,
      marcaId: data.marcaId,
      modeloId: data.modeloId || undefined,
      almacenamientoIds: data.almacenamientoIds || [],
      ramIds: data.ramIds || [],
      colorIds: data.colorIds || [],
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
      void refetch();
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
      void refetch();
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
    description: `${displayTotal} productos registrados`,
    addAction: {
      label: "Agregar producto",
      onClick: openCreateDialog,
    },
    columns,
    onDelete: (product: ProductDTO) => openDeleteDialog(product),
    getRowId: (product: ProductDTO) => product.id,
    showIndexColumn: false,
  };

  const isFormDialogOpen = dialogMode !== null;
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
        data={displayData}
        total={displayTotal}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading || isFetching || isBusy}
        searchValue=""
        onSearchChange={() => {
          // La búsqueda se maneja a través de filtros
        }}
        filters={FILTER_DESCRIPTORS}
        filterState={filterState}
        onFilterStateChange={(next) => {
          setFilterState(next);
          setPage(1);
        }}
        pendingFilterState={pendingFilterState}
        onPendingFilterStateChange={setPendingFilterState}
        onApplyFilters={() => {
          applyFilters();
          setPage(1);
          void refetch();
        }}
        onResetPendingFilters={resetPendingFilters}
        onClearFilters={() => {
          clearFilters();
          setPage(1);
          void refetch();
        }}
        isFilterDialogOpen={isDialogOpen}
        setFilterDialogOpen={setDialogOpen}
        filterOptions={filterOptionsMap}
        isLoadingFilterOptions={isLoadingFilters}
      />

      <Dialog
        open={isFormDialogOpen}
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
                        onValueChange={(value) => {
                          handleTipoProductoChange(value);
                          field.onChange(value);
                        }}
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
                {isCelular && (
                  <>
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
                      name="almacenamientoIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Almacenamiento *</FormLabel>
                          <FormControl>
                            <MultiSelectSearch
                              placeholder="Selecciona uno o más almacenamientos"
                              value={selectedAlmacenamientos}
                              onChange={(options) => {
                                field.onChange(options.map((opt) => opt.value));
                              }}
                              options={almacenamientoOptionsForMultiSelect}
                              disabled={isSubmitting}
                              showSelectedCount={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ramIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RAM *</FormLabel>
                          <FormControl>
                            <MultiSelectSearch
                              placeholder="Selecciona una o más RAM"
                              value={selectedRams}
                              onChange={(options) => {
                                field.onChange(options.map((opt) => opt.value));
                              }}
                              options={ramOptionsForMultiSelect}
                              disabled={isSubmitting}
                              showSelectedCount={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="colorIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color *</FormLabel>
                          <FormControl>
                            <MultiSelectSearch
                              placeholder="Selecciona uno o más colores"
                              value={selectedColors}
                              onChange={(options) => {
                                field.onChange(options.map((opt) => opt.value));
                              }}
                              options={colorOptionsForMultiSelect}
                              disabled={isSubmitting}
                              showSelectedCount={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {!isCelular && (
                  <FormField
                    control={form.control}
                    name="modeloId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
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
                )}
              </div>
              <FormField
                control={form.control}
                name="pvp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Venta al Público (PVP) *</FormLabel>
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

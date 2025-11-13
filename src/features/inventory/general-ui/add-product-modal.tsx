"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createInventoryMovementAction } from "@/features/inventory/actions/create-inventory-movement";
import {
  getMovementFormProducts,
  getMovementFormSuppliers,
  getMovementFormTypes,
  getMovementFormWarehouses,
} from "@/features/inventory/actions/get-movement-form-options";
import {
  createInventoryMovementFormSchema,
  type InventoryMovementFormValues,
  inventoryMovementFormSchema,
} from "@/features/inventory/schemas/movement-form.schemas";

export interface InventoryMovementInitialData {
  product?: string;
  movementType?: string;
  cost?: string;
  quantity?: string;
  imeis?: string;
  warehouse?: string;
  supplier?: string;
}

interface InventoryMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: InventoryMovementInitialData;
  isReadOnly?: boolean;
}

export function InventoryMovementModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isReadOnly = false,
}: InventoryMovementModalProps) {
  const [isPending, startTransition] = useTransition();

  const defaultValues = useMemo(() => {
    const imeisList = initialData?.imeis
      ? initialData.imeis
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

    const initialQuantity =
      initialData?.quantity ??
      (imeisList.length > 0 ? imeisList.length.toString() : "");

    return {
      product: initialData?.product ?? "",
      movementType: initialData?.movementType ?? "",
      cost: initialData?.cost ?? "",
      quantity: initialQuantity,
      imeis: initialData?.imeis ?? "",
      warehouse: initialData?.warehouse ?? "",
      supplier: initialData?.supplier ?? "",
    };
  }, [initialData]);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["inventory-movement-products"],
    queryFn: getMovementFormProducts,
    enabled: isOpen,
  });

  const { data: movementTypes, isLoading: isLoadingMovementTypes } = useQuery({
    queryKey: ["inventory-movement-types"],
    queryFn: getMovementFormTypes,
    enabled: isOpen,
  });

  const { data: warehouses, isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ["inventory-movement-warehouses"],
    queryFn: getMovementFormWarehouses,
    enabled: isOpen,
  });

  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["inventory-movement-suppliers"],
    queryFn: getMovementFormSuppliers,
    enabled: isOpen,
  });

  // Inicializar form con schema base primero
  const form = useForm<InventoryMovementFormValues>({
    resolver: zodResolver(inventoryMovementFormSchema),
    defaultValues,
  });

  // Observar cambios en movementType e imeis para calcular quantity automáticamente
  const movementType = form.watch("movementType");
  const imeis = form.watch("imeis");

  const selectedMovementType = useMemo(
    () => movementTypes?.find((type) => type.id === movementType),
    [movementTypes, movementType],
  );

  const isIngresoMovement = Boolean(selectedMovementType?.ingreso);
  const isHorizontalMovement = Boolean(
    selectedMovementType &&
      !selectedMovementType.ingreso &&
      !selectedMovementType.salida,
  );

  // Crear schema dinámico basado en el tipo de movimiento
  const dynamicSchema = useMemo(
    () => createInventoryMovementFormSchema(selectedMovementType ?? undefined),
    [selectedMovementType],
  );

  // Validar cuando cambia el schema dinámico
  useEffect(() => {
    // Limpiar errores y re-validar con el nuevo schema si hay valores
    form.clearErrors();
    if (form.formState.isDirty || movementType) {
      // Validar manualmente con el nuevo schema
      const validateWithSchema = async () => {
        const result = await dynamicSchema.safeParseAsync(form.getValues());
        if (!result.success) {
          // Aplicar errores del nuevo schema
          result.error.errors.forEach((error) => {
            form.setError(error.path[0] as keyof InventoryMovementFormValues, {
              type: "manual",
              message: error.message,
            });
          });
        }
      };
      validateWithSchema();
    }
  }, [dynamicSchema, form, movementType]);

  // Resetear formulario cuando cambia initialData o isOpen
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, defaultValues, form]);

  // Calcular quantity automáticamente cuando es ingreso y hay IMEIs
  useEffect(() => {
    if (isIngresoMovement && imeis) {
      const imeiCount = imeis
        .split(",")
        .map((imei) => imei.trim())
        .filter(Boolean).length;
      if (imeiCount > 0) {
        form.setValue("quantity", imeiCount.toString(), {
          shouldValidate: true,
        });
      }
    }
  }, [isIngresoMovement, imeis, form]);

  // Calcular quantity automáticamente para movimientos horizontales desde IMEIs
  useEffect(() => {
    if (isHorizontalMovement && imeis) {
      const imeiCount = imeis
        .split(",")
        .map((imei) => imei.trim())
        .filter(Boolean).length;
      if (imeiCount > 0) {
        form.setValue("quantity", imeiCount.toString(), {
          shouldValidate: true,
        });
      }
    }
  }, [isHorizontalMovement, imeis, form]);

  const onSubmit = (data: InventoryMovementFormValues) => {
    if (isReadOnly || isPending) {
      onClose();
      return;
    }

    startTransition(async () => {
      const payload = new FormData();
      // Para movimientos horizontales, product puede estar vacío
      if (data.product && data.product.trim() !== "") {
        payload.set("product", data.product);
      }
      payload.set("movementType", data.movementType);
      // Para movimientos horizontales, cost puede estar vacío
      if (data.cost && data.cost.trim() !== "") {
        payload.set("cost", data.cost);
      }
      // Para movimientos horizontales, quantity se calcula desde IMEIs
      if (data.quantity && data.quantity.trim() !== "") {
        payload.set("quantity", data.quantity);
      }
      payload.set("imeis", data.imeis ?? "");
      payload.set("warehouse", data.warehouse ?? "");
      payload.set("supplier", data.supplier ?? "");

      const result = await createInventoryMovementAction(payload);

      if (!result.success) {
        // Manejar errores del servidor
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, errors]) => {
            form.setError(field as keyof InventoryMovementFormValues, {
              message: errors?.[0] ?? "Error de validación",
            });
          });
        }
        toast.error(result.error ?? "No se pudo crear el movimiento");
        return;
      }

      form.reset();
      toast.success("Movimiento creado exitosamente");
      onSuccess?.();
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
          <DialogDescription>
            Seleccione un producto y los detalles del movimiento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="movementType"
                  render={({ field }) => {
                    const selectedType = movementTypes?.find(
                      (type) => type.id === field.value,
                    );
                    return (
                      <FormItem>
                        <FormLabel>Tipo de Movimiento *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isReadOnly || isLoadingMovementTypes}
                        >
                          <FormControl>
                            <SelectTrigger>
                              {selectedType ? (
                                <span className="flex items-center gap-2">
                                  <span>{selectedType.nombre}</span>
                                  {selectedType.ingreso && (
                                    <span className="text-green-600 dark:text-green-400">
                                      +
                                    </span>
                                  )}
                                  {selectedType.salida && (
                                    <span className="text-red-600 dark:text-red-400">
                                      -
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <SelectValue placeholder="Seleccionar tipo" />
                              )}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {movementTypes?.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                <span className="flex items-center gap-2">
                                  <span>{type.nombre}</span>
                                  {type.ingreso && (
                                    <span className="text-green-600 dark:text-green-400">
                                      +
                                    </span>
                                  )}
                                  {type.salida && (
                                    <span className="text-red-600 dark:text-red-400">
                                      -
                                    </span>
                                  )}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="warehouse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bodega{isHorizontalMovement ? " *" : ""}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                        disabled={isReadOnly || isLoadingWarehouses}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar bodega" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses?.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isHorizontalMovement && (
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Producto *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isReadOnly || isLoadingProducts}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!isHorizontalMovement && (
                  <FormField
                    control={form.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                          disabled={isReadOnly || isLoadingSuppliers}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers?.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!isHorizontalMovement && (
                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo Unitario *</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            placeholder="0"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            readOnly={isReadOnly}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!isHorizontalMovement && (
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            disabled={isIngresoMovement || isReadOnly}
                            readOnly={isReadOnly}
                            {...field}
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
                name="imeis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      IMEIs (separados por coma)
                      {isHorizontalMovement ? " *" : ""}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ej. 123..., 456..."
                        className="min-h-[80px]"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {isReadOnly ? "Cerrar" : "Cancelar"}
              </Button>
              {isReadOnly ? null : (
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Guardando..." : "Guardar Movimiento"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

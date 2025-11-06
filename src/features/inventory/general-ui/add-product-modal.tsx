"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  listInventoryMovementProducts,
  listInventoryMovementTypes,
} from "@/data/repositories/inventory-movements.repository";
import { createInventoryMovementAction } from "@/features/inventory/actions/create-inventory-movement";

type FormField = "product" | "movementType" | "cost" | "quantity" | "imeis";
type FieldErrors = Partial<Record<FormField, string[]>>;

export interface InventoryMovementInitialData {
  product?: string;
  movementType?: string;
  cost?: string;
  quantity?: string;
  imeis?: string;
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
  const [formData, setFormData] = useState(() => {
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
    };
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["inventory-movement-products"],
    queryFn: listInventoryMovementProducts,
    enabled: isOpen,
  });

  const { data: movementTypes, isLoading: isLoadingMovementTypes } = useQuery({
    queryKey: ["inventory-movement-types"],
    queryFn: listInventoryMovementTypes,
    enabled: isOpen,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly || isPending) {
      onClose();
      return;
    }

    startTransition(async () => {
      const payload = new FormData();
      payload.set("product", formData.product);
      payload.set("movementType", formData.movementType);
      payload.set("cost", formData.cost);
      payload.set("quantity", formData.quantity);
      payload.set("imeis", formData.imeis);

      const result = await createInventoryMovementAction(payload);

      if (!result.success) {
        setFieldErrors(result.errors ?? {});
        toast.error(result.error ?? "No se pudo crear el movimiento");
        return;
      }

      setFieldErrors({});
      setFormData({
        product: "",
        movementType: "",
        cost: "",
        quantity: "",
        imeis: "",
      });
      toast.success("Movimiento creado exitosamente");
      onSuccess?.();
      onClose();
    });
  };

  const selectedMovementType = movementTypes?.find(
    (type) => type.id === formData.movementType,
  );
  const isIngresoMovement = Boolean(selectedMovementType?.ingreso);

  const handleChange = (field: FormField, value: string) => {
    if (isReadOnly) {
      return;
    }

    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      const activeMovementType = movementTypes?.find(
        (type) => type.id === next.movementType,
      );

      if (activeMovementType?.ingreso) {
        const imeiCount = next.imeis
          .split(",")
          .map((imei) => imei.trim())
          .filter(Boolean).length;
        next.quantity = imeiCount > 0 ? imeiCount.toString() : "";
      }

      return next;
    });

    setFieldErrors((prev) => {
      if (!prev[field] && field !== "imeis" && field !== "movementType") {
        return prev;
      }

      const { [field]: _, ...rest } = prev;

      if (field === "imeis" || field === "movementType") {
        if ("quantity" in rest) {
          const { quantity: __, ...restWithoutQuantity } = rest;
          return restWithoutQuantity;
        }
        return rest;
      }

      return rest;
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product">Producto *</Label>
                <Select
                  value={formData.product}
                  onValueChange={(value) => handleChange("product", value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    id="product"
                    disabled={isLoadingProducts || isReadOnly}
                  >
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.product ? (
                  <p className="text-xs text-error">{fieldErrors.product[0]}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="movementType">Tipo de Movimiento *</Label>
                <Select
                  value={formData.movementType}
                  onValueChange={(value) => handleChange("movementType", value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    id="movementType"
                    disabled={isLoadingMovementTypes || isReadOnly}
                  >
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {movementTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.movementType ? (
                  <p className="text-xs text-error">
                    {fieldErrors.movementType[0]}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Costo Unitario *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => handleChange("cost", e.target.value)}
                  required
                  readOnly={isReadOnly}
                  disabled={isReadOnly}
                />
                {fieldErrors.cost ? (
                  <p className="text-xs text-error">{fieldErrors.cost[0]}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  required
                  disabled={isIngresoMovement || isReadOnly}
                  readOnly={isReadOnly}
                />
                {fieldErrors.quantity ? (
                  <p className="text-xs text-error">
                    {fieldErrors.quantity[0]}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imeis">IMEIs (separados por coma)</Label>
              <Textarea
                id="imeis"
                placeholder="ej. 123..., 456..."
                value={formData.imeis}
                onChange={(e) => handleChange("imeis", e.target.value)}
                className="min-h-[80px]"
                readOnly={isReadOnly}
                disabled={isReadOnly}
              />
              {fieldErrors.imeis ? (
                <p className="text-xs text-error">{fieldErrors.imeis[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {isReadOnly ? "Cerrar" : "Cancelar"}
            </Button>
            {isReadOnly ? null : (
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar Movimiento"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

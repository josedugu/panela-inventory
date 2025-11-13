"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputSearch } from "@/components/ui/input-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { getSaleForEditAction } from "../actions/get-sale-for-edit";
import { getSaleFormData } from "../actions/get-sale-form-data";

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId?: string | null;
}

interface SaleLine {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

function createEmptyLine(): SaleLine {
  return {
    id: crypto.randomUUID(),
    productId: "",
    quantity: 1,
    unitPrice: 0,
  };
}

export function CreateSaleModal({
  isOpen,
  onClose,
  saleId,
}: CreateSaleModalProps) {
  const [lines, setLines] = useState<SaleLine[]>([createEmptyLine()]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!saleId;

  const { data, isLoading } = useQuery({
    queryKey: ["sale-form-data"],
    queryFn: getSaleFormData,
    enabled: isOpen,
  });

  const { data: saleForEdit, isLoading: isLoadingSaleForEdit } = useQuery({
    queryKey: ["sale-for-edit", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      return await getSaleForEditAction(saleId);
    },
    enabled: isOpen && isEditMode && !!saleId,
  });

  const productOptions = data?.products ?? [];
  const customerOptions = data?.customers ?? [];

  // Cargar datos de la venta cuando está en modo edición
  useEffect(() => {
    if (isOpen && isEditMode && saleForEdit?.success) {
      const saleData = saleForEdit.data;
      setSelectedCustomer(saleData.clienteId);
      setLines(
        saleData.lines.length > 0 ? saleData.lines : [createEmptyLine()],
      );
    } else if (isOpen && !isEditMode) {
      // Resetear cuando se abre en modo crear
      setSelectedCustomer("");
      setLines([createEmptyLine()]);
    }
  }, [isOpen, isEditMode, saleForEdit]);

  // Resetear cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedCustomer("");
      setLines([createEmptyLine()]);
    }
  }, [isOpen]);

  const lineDetails = useMemo(() => {
    return lines.map((line) => {
      const product = productOptions.find(
        (option) => option.id === line.productId,
      );
      if (!product) {
        return {
          ...line,
          label: "Selecciona un producto",
          availableQuantity: 0,
          discountName: undefined,
          discountAmount: 0,
          cost: 0,
          lineSubtotal: 0,
          lineDiscount: 0,
        };
      }

      const unitPrice = line.unitPrice || product.cost;
      const lineSubtotal = unitPrice * line.quantity;
      const lineDiscount = product.discount?.amount
        ? product.discount.amount * line.quantity
        : 0;

      return {
        ...line,
        label: product.label,
        availableQuantity: product.availableQuantity,
        discountName: product.discount?.name,
        discountAmount: product.discount?.amount ?? 0,
        cost: product.cost,
        lineSubtotal,
        lineDiscount,
      };
    });
  }, [lines, productOptions]);

  const subtotal = lineDetails.reduce(
    (sum, line) => sum + line.lineSubtotal,
    0,
  );
  const totalDiscounts = lineDetails.reduce(
    (sum, line) => sum + line.lineDiscount,
    0,
  );
  const total = subtotal - totalDiscounts;

  const handleProductChange = (lineId: string, productId: string) => {
    setLines((previous) =>
      previous.map((line) => {
        if (line.id !== lineId) {
          return line;
        }
        const product = productOptions.find(
          (option) => option.id === productId,
        );
        return {
          ...line,
          productId,
          unitPrice: product ? product.cost : 0,
          quantity: product
            ? Math.min(line.quantity, Math.max(1, product.availableQuantity))
            : line.quantity,
        };
      }),
    );
  };

  const handleQuantityChange = (lineId: string, value: string) => {
    const quantity = Number.parseInt(value, 10);
    if (Number.isNaN(quantity) || quantity <= 0) {
      return;
    }
    setLines((previous) =>
      previous.map((line) =>
        line.id === lineId
          ? {
              ...line,
              quantity: (() => {
                const product = productOptions.find(
                  (option) => option.id === line.productId,
                );
                if (!product) return quantity;
                return Math.min(
                  quantity,
                  Math.max(1, product.availableQuantity),
                );
              })(),
            }
          : line,
      ),
    );
  };

  const handleUnitPriceChange = (lineId: string, value: string) => {
    const price = Number.parseFloat(value);
    if (Number.isNaN(price) || price < 0) {
      return;
    }
    setLines((previous) =>
      previous.map((line) =>
        line.id === lineId
          ? {
              ...line,
              unitPrice: price,
            }
          : line,
      ),
    );
  };

  const handleRemoveLine = (lineId: string) => {
    setLines((previous) => {
      if (previous.length === 1) {
        return previous;
      }
      return previous.filter((line) => line.id !== lineId);
    });
  };

  const handleAddLine = () => {
    setLines((previous) => [...previous, createEmptyLine()]);
  };

  const handleSubmit = () => {
    const hasInvalidProduct = lines.some((line) => !line.productId);
    if (!selectedCustomer) {
      toast.error("Selecciona un cliente antes de registrar la venta");
      return;
    }
    if (hasInvalidProduct) {
      toast.error("Selecciona un producto para cada línea de la venta");
      return;
    }

    startTransition(async () => {
      if (isEditMode) {
        // TODO: Wire with update sale action when available
        toast.success("Venta actualizada (mock)");
      } else {
        // TODO: Wire with create sale action when available
        toast.success("Venta registrada (mock)");
      }
      onClose();
    });
  };

  const isSubmitDisabled =
    isPending ||
    isLoadingSaleForEdit ||
    !selectedCustomer ||
    lines.some((line) => !line.productId || line.quantity <= 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-8xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar venta" : "Registrar venta"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-sm font-medium text-text">Cliente *</span>
            {isLoading || isLoadingSaleForEdit ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedCustomer}
                onValueChange={setSelectedCustomer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customerOptions.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text">
                Productos seleccionados
              </span>
              <Button type="button" variant="outline" onClick={handleAddLine}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar producto
              </Button>
            </div>

            {lineDetails.length > 0 && (
              <div className="hidden grid-cols-12 gap-4 pb-2 text-xs font-medium uppercase tracking-wide text-text-secondary sm:grid md:grid-cols-12 md:gap-8">
                <div className="text-left md:col-span-5">Producto</div>
                <div className="text-left sm:col-span-6 md:col-span-2">
                  Descuento
                </div>
                <div className="text-left sm:col-span-6 md:col-span-2">
                  Precio unitario
                </div>
                <div className="text-left sm:col-span-6 md:col-span-2">
                  Cantidad
                </div>
                <div className="sm:col-span-6 md:col-span-1"></div>
              </div>
            )}

            <div className="space-y-4">
              {lineDetails.map((line) => {
                const discountInputId = `discount-${line.id}`;
                const unitPriceInputId = `unit-price-${line.id}`;
                const quantityInputId = `quantity-${line.id}`;

                return (
                  <div
                    key={line.id}
                    className="space-y-4 rounded-lg border border-border/60 bg-surface-1 p-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
                      {isLoading || isLoadingSaleForEdit ? (
                        <div className="sm:col-span-12">
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : (
                        <div className="sm:col-span-12 md:col-span-5">
                          <InputSearch
                            placeholder="Buscar producto"
                            value={
                              line.productId
                                ? {
                                    value: line.productId,
                                    label:
                                      productOptions.find(
                                        (option) =>
                                          option.id === line.productId,
                                      )?.label ?? "",
                                  }
                                : undefined
                            }
                            onChange={(option) =>
                              handleProductChange(line.id, option?.value ?? "")
                            }
                            options={productOptions.map((product) => ({
                              value: product.id,
                              label: product.label,
                            }))}
                            loading={isLoading}
                          />
                        </div>
                      )}

                      <div className="sm:col-span-6 md:col-span-2">
                        <Input
                          id={discountInputId}
                          readOnly
                          disabled
                          className="cursor-not-allowed bg-surface-2 text-right opacity-75"
                          value={
                            line.discountAmount > 0
                              ? `${formatPrice(line.discountAmount, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })} ${
                                  line.discountName
                                    ? `(${line.discountName})`
                                    : ""
                                }`
                              : "-"
                          }
                        />
                      </div>

                      <div className="sm:col-span-6 md:col-span-2">
                        <Input
                          id={unitPriceInputId}
                          className="text-right"
                          type="number"
                          min={0.01}
                          step="0.01"
                          value={line.unitPrice}
                          onChange={(event) =>
                            handleUnitPriceChange(line.id, event.target.value)
                          }
                        />
                      </div>

                      <div className="sm:col-span-6 md:col-span-2">
                        <Input
                          id={quantityInputId}
                          className="text-right"
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(event) =>
                            handleQuantityChange(line.id, event.target.value)
                          }
                        />
                      </div>

                      <div className="flex items-end justify-end sm:col-span-6 md:col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLine(line.id)}
                          disabled={lines.length === 1}
                          aria-label="Eliminar producto"
                          className="h-9"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-text">Resumen</span>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(subtotal, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Descuentos</span>
                <span className="font-medium text-destructive">
                  -
                  {formatPrice(totalDiscounts, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>
                  {formatPrice(total, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled || isLoadingSaleForEdit}
            >
              {isPending
                ? "Guardando..."
                : isEditMode
                  ? "Actualizar venta"
                  : "Registrar venta"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

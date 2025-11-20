"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputSearchDB } from "@/components/ui/input-search-db";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { getSaleForEditAction } from "../actions/get-sale-for-edit";
import { searchCustomersAction } from "../actions/search-customers";
import { searchProductsAction } from "../actions/search-products";

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

  // Estado para almacenar los productos y clientes seleccionados
  const [selectedProductData, setSelectedProductData] = useState<
    Map<string, { label: string; pvp: number; availableQuantity: number }>
  >(new Map());
  const [selectedCustomerData, setSelectedCustomerData] = useState<
    Map<string, { label: string }>
  >(new Map());

  const { data: saleForEdit, isLoading: isLoadingSaleForEdit } = useQuery({
    queryKey: ["sale-for-edit", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      return await getSaleForEditAction(saleId);
    },
    enabled: isOpen && isEditMode && !!saleId,
  });

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
      const product = selectedProductData.get(line.productId);
      if (!product) {
        return {
          ...line,
          label: "Selecciona un producto",
          availableQuantity: 0,
          pvp: 0,
          lineSubtotal: 0,
        };
      }

      const unitPrice = line.unitPrice || product.pvp;
      const lineSubtotal = unitPrice * line.quantity;

      return {
        ...line,
        label: product.label,
        availableQuantity: product.availableQuantity,
        pvp: product.pvp,
        lineSubtotal,
      };
    });
  }, [lines, selectedProductData]);

  const subtotal = lineDetails.reduce(
    (sum, line) => sum + line.lineSubtotal,
    0,
  );
  const total = subtotal;

  const clampQuantity = (quantity: number, productId: string) => {
    if (quantity <= 0) {
      return 1;
    }
    const product = selectedProductData.get(productId);
    if (!product) {
      return quantity;
    }
    const maxAvailable = Math.max(1, product.availableQuantity);
    return Math.min(quantity, maxAvailable);
  };

  const handleProductChange = (
    lineId: string,
    product:
      | { value: string; label: string; pvp: number; availableQuantity: number }
      | undefined,
  ) => {
    if (!product) {
      setLines((previous) =>
        previous.map((line) =>
          line.id === lineId ? { ...line, productId: "", unitPrice: 0 } : line,
        ),
      );
      return;
    }

    // Guardar los datos del producto seleccionado
    setSelectedProductData((prev) => {
      const newMap = new Map(prev);
      newMap.set(product.value, {
        label: product.label,
        pvp: product.pvp,
        availableQuantity: product.availableQuantity,
      });
      return newMap;
    });

    setLines((previous) =>
      previous.map((line) => {
        if (line.id !== lineId) {
          return line;
        }
        return {
          ...line,
          productId: product.value,
          unitPrice: product.pvp,
          quantity: Math.min(
            line.quantity,
            Math.max(1, product.availableQuantity),
          ),
        };
      }),
    );
  };

  const handleQuantityChange = (lineId: string, value: string) => {
    const sanitized = value.replace(/\D/g, "");
    setLines((previous) =>
      previous.map((line) => {
        if (line.id !== lineId) {
          return line;
        }

        if (!sanitized) {
          return { ...line, quantity: 0 };
        }

        const parsed = Number.parseInt(sanitized, 10);
        if (Number.isNaN(parsed)) {
          return line;
        }

        return {
          ...line,
          quantity: clampQuantity(parsed, line.productId),
        };
      }),
    );
  };

  const handleQuantityBlur = (lineId: string) => {
    setLines((previous) =>
      previous.map((line) =>
        line.id === lineId
          ? {
              ...line,
              quantity: clampQuantity(line.quantity || 0, line.productId),
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
      <DialogContent className="w-[min(90vw,1100px)] max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar venta" : "Registrar venta"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-sm font-medium text-text">Cliente *</span>
            {isLoadingSaleForEdit ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <InputSearchDB
                placeholder="Buscar por nombre o cédula"
                value={
                  selectedCustomer
                    ? {
                        value: selectedCustomer,
                        label:
                          selectedCustomerData.get(selectedCustomer)?.label ??
                          "",
                      }
                    : undefined
                }
                onChange={(option) => {
                  if (option) {
                    setSelectedCustomer(option.value);
                    setSelectedCustomerData((prev) => {
                      const newMap = new Map(prev);
                      newMap.set(option.value, { label: option.label });
                      return newMap;
                    });
                  } else {
                    setSelectedCustomer("");
                  }
                }}
                searchFn={searchCustomersAction}
                queryKeyBase="customers"
              />
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
                <div className="text-left md:col-span-6">Producto</div>
                <div className="text-left sm:col-span-6 md:col-span-3">
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
                const unitPriceInputId = `unit-price-${line.id}`;
                const quantityInputId = `quantity-${line.id}`;

                return (
                  <div
                    key={line.id}
                    className="space-y-4 rounded-lg border border-border/60 bg-surface-1 p-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
                      {isLoadingSaleForEdit ? (
                        <div className="sm:col-span-12">
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : (
                        <div className="sm:col-span-12 md:col-span-6">
                          <InputSearchDB
                            placeholder="Buscar producto"
                            value={
                              line.productId
                                ? {
                                    value: line.productId,
                                    label:
                                      selectedProductData.get(line.productId)
                                        ?.label ?? "",
                                  }
                                : undefined
                            }
                            onChange={async (option) => {
                              if (option) {
                                // Obtener los datos completos del producto por ID
                                const products = await searchProductsAction(
                                  option.value,
                                );
                                const product = products[0];

                                if (product) {
                                  handleProductChange(line.id, {
                                    value: product.id,
                                    label: product.label,
                                    pvp: product.pvp,
                                    availableQuantity:
                                      product.availableQuantity,
                                  });
                                }
                              } else {
                                handleProductChange(line.id, undefined);
                              }
                            }}
                            searchFn={async (query) => {
                              const products =
                                await searchProductsAction(query);
                              // Guardar los datos completos en el estado
                              products.forEach((p) => {
                                setSelectedProductData((prev) => {
                                  const newMap = new Map(prev);
                                  newMap.set(p.id, {
                                    label: p.label,
                                    pvp: p.pvp,
                                    availableQuantity: p.availableQuantity,
                                  });
                                  return newMap;
                                });
                              });
                              return products.map((p) => ({
                                value: p.id,
                                label: p.label,
                              }));
                            }}
                            queryKeyBase="products"
                            valueClassName="whitespace-normal break-words text-left"
                          />
                        </div>
                      )}

                      <div className="sm:col-span-6 md:col-span-3">
                        <CurrencyInput
                          id={unitPriceInputId}
                          value={
                            line.unitPrice > 0 ? line.unitPrice.toString() : ""
                          }
                          onChange={(value) =>
                            handleUnitPriceChange(line.id, value)
                          }
                        />
                      </div>

                      <div className="sm:col-span-6 md:col-span-2">
                        <Input
                          id={quantityInputId}
                          className="text-right"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min={1}
                          value={line.quantity === 0 ? "" : line.quantity}
                          onChange={(event) =>
                            handleQuantityChange(line.id, event.target.value)
                          }
                          onBlur={() => handleQuantityBlur(line.id)}
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

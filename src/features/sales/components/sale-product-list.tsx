"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { InputSearchDB } from "@/components/ui/input-search-db";
import { formatPrice } from "@/lib/utils";
import { searchProductsAction } from "../actions/search-products";

export interface SaleLine {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface ProductData {
  label: string;
  pvp: number;
  availableQuantity: number;
}

interface SaleProductListProps {
  lines: SaleLine[];
  setLines: (lines: SaleLine[]) => void;
  selectedProductData: Map<string, ProductData>;
  setSelectedProductData: React.Dispatch<
    React.SetStateAction<Map<string, ProductData>>
  >;
  onAddLine: () => void;
}

export function SaleProductList({
  lines,
  setLines,
  selectedProductData,
  setSelectedProductData,
  onAddLine,
}: SaleProductListProps) {
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
      setLines(
        lines.map((line) =>
          line.id === lineId ? { ...line, productId: "", unitPrice: 0 } : line,
        ),
      );
      return;
    }

    setSelectedProductData((prev) => {
      const newMap = new Map(prev);
      newMap.set(product.value, {
        label: product.label,
        pvp: product.pvp,
        availableQuantity: product.availableQuantity,
      });
      return newMap;
    });

    setLines(
      lines.map((line) => {
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
    setLines(
      lines.map((line) => {
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
    setLines(
      lines.map((line) =>
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
    setLines(
      lines.map((line) =>
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
    if (lines.length === 1) {
      return;
    }
    setLines(lines.filter((line) => line.id !== lineId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">
          Productos seleccionados
        </span>
        <Button type="button" variant="outline" onClick={onAddLine}>
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
          <div className="text-left sm:col-span-6 md:col-span-2">Cantidad</div>
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
                <div className="sm:col-span-12 md:col-span-6">
                  <InputSearchDB
                    placeholder="Buscar producto"
                    value={
                      line.productId
                        ? {
                            value: line.productId,
                            label:
                              selectedProductData.get(line.productId)?.label ??
                              "",
                          }
                        : undefined
                    }
                    onChange={async (option) => {
                      if (option) {
                        const products = await searchProductsAction(
                          option.value,
                        );
                        const product = products[0];

                        if (product) {
                          handleProductChange(line.id, {
                            value: product.id,
                            label: product.label,
                            pvp: product.pvp,
                            availableQuantity: product.availableQuantity,
                          });
                        }
                      } else {
                        handleProductChange(line.id, undefined);
                      }
                    }}
                    searchFn={async (query) => {
                      const products = await searchProductsAction(query);
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

                <div className="sm:col-span-6 md:col-span-3">
                  <CurrencyInput
                    id={unitPriceInputId}
                    value={line.unitPrice > 0 ? line.unitPrice.toString() : ""}
                    onChange={(value) => handleUnitPriceChange(line.id, value)}
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

      <div className="space-y-2 pt-4 border-t">
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total Venta</span>
          <span>
            {formatPrice(total, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

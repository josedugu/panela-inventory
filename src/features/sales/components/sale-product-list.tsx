"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { InputSearchDB } from "@/components/ui/input-search-db";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectSkeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { getAccessibleWarehousesAction } from "../actions/get-accessible-warehouses";
import { searchProductsAction } from "../actions/search-products";

export interface SaleLine {
  id: string;
  productId: string;
  productoDetalleId?: string;
  quantity: number;
  unitPrice: number;
}

export interface ProductData {
  label: string;
  costo: number;
  pvp: number;
  precioOferta: number | null;
  esProductoBase: boolean;
  availableQuantity: number;
  productoDetalleId?: string;
  imei?: string | null;
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
  // Estado para la bodega seleccionada
  const [selectedBodegaId, setSelectedBodegaId] = useState<string | null>(null);

  // Obtener bodegas accesibles
  const { data: warehouses = [], isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ["accessible-warehouses"],
    queryFn: async () => {
      const result = await getAccessibleWarehousesAction();
      if (result.success) {
        return result.data;
      }
      return [];
    },
  });

  // Auto-seleccionar la primera bodega si hay solo una disponible
  useEffect(() => {
    if (warehouses.length === 1 && !selectedBodegaId) {
      setSelectedBodegaId(warehouses[0].id);
    }
  }, [warehouses, selectedBodegaId]);

  // Detectar si hay al menos un producto base en la lista
  const hayProductoBase = useMemo(() => {
    return lines.some((line) => {
      const product = selectedProductData.get(line.productId);
      return product?.esProductoBase === true;
    });
  }, [lines, selectedProductData]);

  const lineDetails = useMemo(() => {
    return lines.map((line) => {
      const product = selectedProductData.get(line.productId);
      if (!product) {
        return {
          ...line,
          label: "Selecciona un producto",
          availableQuantity: 0,
          pvp: 0,
          precioOferta: null,
          esProductoBase: false,
          aplicaOferta: false,
          lineSubtotal: 0,
        };
      }

      // Determinar si aplica el precio de oferta
      const aplicaOferta =
        hayProductoBase &&
        product.precioOferta !== null &&
        !product.esProductoBase;

      // Calcular el precio efectivo
      const precioEfectivo = aplicaOferta
        ? (product.precioOferta ?? 0)
        : product.pvp;

      // Si el precio actual del line no coincide con el efectivo, usar el efectivo
      const unitPrice =
        line.unitPrice === product.pvp || line.unitPrice === 0
          ? precioEfectivo
          : line.unitPrice;

      const lineSubtotal = unitPrice * line.quantity;

      return {
        ...line,
        label: product.label,
        availableQuantity: product.availableQuantity,
        pvp: product.pvp,
        precioOferta: product.precioOferta,
        esProductoBase: product.esProductoBase,
        aplicaOferta,
        unitPrice,
        lineSubtotal,
      };
    });
  }, [lines, selectedProductData, hayProductoBase]);

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
      | {
          value: string;
          label: string;
          costo: number;
          pvp: number;
          precioOferta: number | null;
          esProductoBase: boolean;
          availableQuantity: number;
          productoDetalleId?: string;
          imei?: string | null;
        }
      | undefined,
  ) => {
    if (!product) {
      setLines(
        lines.map((line) =>
          line.id === lineId
            ? {
                ...line,
                productId: "",
                productoDetalleId: undefined,
                unitPrice: 0,
              }
            : line,
        ),
      );
      return;
    }

    setSelectedProductData((prev) => {
      const newMap = new Map(prev);
      newMap.set(product.value, {
        label: product.label,
        costo: product.costo,
        pvp: product.pvp,
        precioOferta: product.precioOferta,
        esProductoBase: product.esProductoBase,
        availableQuantity: product.availableQuantity,
        productoDetalleId: product.productoDetalleId,
        imei: product.imei,
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
          productoDetalleId: product.productoDetalleId,
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

  const handleBodegaChange = (bodegaId: string) => {
    setSelectedBodegaId(bodegaId);
    // Limpiar productos seleccionados cuando cambia la bodega
    setSelectedProductData(new Map());
    // Limpiar las líneas de productos
    setLines(
      lines.map((line) => ({
        ...line,
        productId: "",
        productoDetalleId: undefined,
        unitPrice: 0,
      })),
    );
  };

  return (
    <div className="space-y-4">
      {/* Select de Bodegas */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-text">Bodega</div>
        {isLoadingWarehouses ? (
          <SelectSkeleton />
        ) : (
          <Select
            value={selectedBodegaId ?? ""}
            onValueChange={handleBodegaChange}
          >
            <SelectTrigger>
              <span className="truncate">
                {selectedBodegaId
                  ? (warehouses.find((w) => w.id === selectedBodegaId)
                      ?.nombre ?? "Seleccionar bodega")
                  : "Seleccionar bodega"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">
          Productos seleccionados
        </span>
        <Button
          type="button"
          variant="outline"
          onClick={onAddLine}
          disabled={!selectedBodegaId}
        >
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
                    placeholder={
                      selectedBodegaId
                        ? "Buscar por IMEI o nombre"
                        : "Selecciona una bodega primero"
                    }
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
                    onChange={(option) => {
                      if (option) {
                        // Usar la data que ya tenemos en selectedProductData
                        const cachedProduct = selectedProductData.get(
                          option.value,
                        );
                        if (cachedProduct) {
                          handleProductChange(line.id, {
                            value: option.value,
                            label: cachedProduct.label,
                            costo: cachedProduct.costo,
                            pvp: cachedProduct.pvp,
                            precioOferta: cachedProduct.precioOferta,
                            esProductoBase: cachedProduct.esProductoBase,
                            availableQuantity: cachedProduct.availableQuantity,
                            productoDetalleId: cachedProduct.productoDetalleId,
                            imei: cachedProduct.imei,
                          });
                        }
                      } else {
                        handleProductChange(line.id, undefined);
                      }
                    }}
                    searchFn={async (query) => {
                      if (!selectedBodegaId) {
                        return [];
                      }
                      const products = await searchProductsAction(
                        query,
                        selectedBodegaId,
                      );
                      products.forEach((p) => {
                        setSelectedProductData((prev) => {
                          const newMap = new Map(prev);
                          newMap.set(p.id, {
                            label: p.label,
                            costo: p.costo,
                            pvp: p.pvp,
                            precioOferta: p.precioOferta,
                            esProductoBase: p.esProductoBase,
                            availableQuantity: p.availableQuantity,
                            productoDetalleId: p.productoDetalleId,
                            imei: p.imei,
                          });
                          return newMap;
                        });
                      });
                      return products.map((p) => ({
                        value: p.id,
                        label: p.label,
                      }));
                    }}
                    disabled={!selectedBodegaId}
                    queryKeyBase="products"
                    valueClassName="whitespace-normal break-words text-left"
                  />
                </div>

                <div className="sm:col-span-6 md:col-span-3">
                  <CurrencyInput
                    id={unitPriceInputId}
                    value={line.unitPrice.toString()}
                    onChange={(value) => handleUnitPriceChange(line.id, value)}
                    disabled={line.aplicaOferta}
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

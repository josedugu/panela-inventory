"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ShoppingCart,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import { createSaleAction } from "../actions/create-sale";
import type { CustomerFormData } from "./customer-create-form";
import { CustomerSearchSection } from "./customer-search-section";
import { type Payment, SalePaymentSection } from "./sale-payment-section";
import {
  type ProductData,
  type SaleLine,
  SaleProductList,
} from "./sale-product-list";

export function CreateSalePage() {
  const router = useRouter();
  const idCounterRef = useRef(0);
  const baseId = useId();

  // --- State Management ---

  // Tabs
  const [activeTab, setActiveTab] = useState("customer");

  // Step 1: Customer
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerFormData | null>(
    null,
  );
  const [selectedCustomerLabel, setSelectedCustomerLabel] = useState<
    string | undefined
  >(undefined);

  // Step 2: Products
  const createEmptyLine = (): SaleLine => {
    idCounterRef.current += 1;
    return {
      id: `${baseId}-line-${idCounterRef.current}`,
      productId: "",
      productoDetalleId: undefined,
      quantity: 1,
      unitPrice: 0,
    };
  };
  const [lines, setLines] = useState<SaleLine[]>(() => [createEmptyLine()]);
  const [selectedProductData, setSelectedProductData] = useState<
    Map<string, ProductData>
  >(new Map());

  // Step 3: Payments
  const [payments, setPayments] = useState<Payment[]>([]);

  const [isPending, startTransition] = useTransition();

  // --- Derived State ---

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
          lineSubtotal: 0,
          precioEfectivo: 0,
          costo: 0,
          aplicaOferta: false,
        };
      }

      // Determinar si aplica el precio de oferta
      const aplicaOferta =
        hayProductoBase &&
        product.precioOferta !== null &&
        !product.esProductoBase;

      // Calcular el precio base (oferta o PVP)
      const precioBase = aplicaOferta
        ? (product.precioOferta ?? 0)
        : product.pvp;

      // Si el usuario modificó el precio manualmente, usar ese valor
      // (se considera modificado si es diferente del PVP y diferente de 0)
      const precioEfectivo =
        line.unitPrice === product.pvp || line.unitPrice === 0
          ? precioBase
          : line.unitPrice;

      const lineSubtotal = precioEfectivo * line.quantity;
      return {
        ...line,
        lineSubtotal,
        precioEfectivo,
        costo: product.costo,
        aplicaOferta,
      };
    });
  }, [lines, selectedProductData, hayProductoBase]);

  const totalSale = lineDetails.reduce(
    (sum, line) => sum + line.lineSubtotal,
    0,
  );

  // Verificar si hay productos vendidos bajo costo (excluyendo ofertas válidas)
  const hayProductoBajoCosto = useMemo(() => {
    return lineDetails.some((line) => {
      // Si aplica oferta, no es un problema (es una oferta válida)
      if (line.aplicaOferta) return false;
      // Si el precio efectivo es menor al costo, hay problema
      return line.precioEfectivo < line.costo && line.costo > 0;
    });
  }, [lineDetails]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const _remaining = totalSale - totalPaid;

  // --- Validation ---

  const isCustomerValid = !!selectedCustomer || !!customerData;
  const isProductsValid =
    lines.length > 0 &&
    lines.every((line) => line.productId && line.quantity > 0);
  // Payment validation: technically optional if we allow credit, but let's assume we want >= 0 check
  // For now, we don't block on payments unless required by business logic.
  // Let's assume we just need at least one payment or full payment?
  // The user didn't specify strict rules, so let's just ensure amounts are valid numbers.
  const _isPaymentsValid = payments.every((p) => p.amount > 0 && p.methodId);

  // --- Handlers ---

  const handleNext = () => {
    if (activeTab === "customer") {
      if (isCustomerValid) setActiveTab("products");
      else toast.error("Selecciona o crea un cliente");
    } else if (activeTab === "products") {
      if (isProductsValid) setActiveTab("payments");
      else toast.error("Agrega al menos un producto válido");
    }
  };

  const handleBack = () => {
    if (activeTab === "products") setActiveTab("customer");
    else if (activeTab === "payments") setActiveTab("products");
  };

  const handleSubmit = () => {
    if (!isCustomerValid) {
      toast.error("Falta información del cliente");
      return;
    }
    if (!isProductsValid) {
      toast.error("Falta información de productos");
      return;
    }

    if (Math.abs(totalSale - totalPaid) > 0.1) {
      toast.error(
        "El monto total de pagos no coincide con el valor total de la compra",
      );
      return;
    }

    // TODO: Payment validation logic if needed in future

    startTransition(async () => {
      // Usar precios efectivos (con oferta aplicada si corresponde)
      const linesToSubmit = lineDetails.map((line) => ({
        productId: line.productId,
        productoDetalleId: line.productoDetalleId,
        quantity: line.quantity,
        unitPrice: line.precioEfectivo,
      }));

      const result = await createSaleAction({
        customerId: selectedCustomer ?? undefined,
        customerData: customerData ?? undefined,
        lines: linesToSubmit,
        payments: payments.map((payment) => ({
          methodId: payment.methodId,
          amount: payment.amount,
        })),
      });

      if (result.success) {
        toast.success("Venta registrada exitosamente");
        router.push("/dashboard/sales");
      } else {
        toast.error(result.error || "Error al registrar la venta");
      }
    });
  };

  const isSubmitDisabled =
    isPending || !isCustomerValid || !isProductsValid || hayProductoBajoCosto;

  return (
    <div className="container mx-auto max-w-5xl py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrar venta</h1>
        <p className="text-sm text-text-secondary">
          Sigue los pasos para crear una nueva venta
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="customer" disabled={isPending}>
            <User className="mr-2 h-4 w-4" /> Cliente
          </TabsTrigger>
          <TabsTrigger
            value="products"
            disabled={!isCustomerValid || isPending}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Productos
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            disabled={!isCustomerValid || !isProductsValid || isPending}
          >
            <CreditCard className="mr-2 h-4 w-4" /> Pagos
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 min-h-[400px]">
          <TabsContent value="customer" className="m-0 focus-visible:ring-0">
            <div className="rounded-lg border p-6 shadow-sm bg-card">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">
                  Información del Cliente
                </h2>
                <p className="text-sm text-text-secondary">
                  Busca un cliente existente o crea uno nuevo.
                </p>
              </div>
              <CustomerSearchSection
                selectedCustomerId={selectedCustomer ?? ""}
                onCustomerChange={(customerId) => {
                  setSelectedCustomer(customerId);
                  if (!customerId) {
                    setSelectedCustomerLabel(undefined);
                  }
                }}
                onCustomerLabelChange={setSelectedCustomerLabel}
                onCustomerDataChange={(data) => {
                  setCustomerData(data);
                  if (data) {
                    setSelectedCustomer(null);
                    setSelectedCustomerLabel(undefined);
                  }
                }}
                selectedCustomerLabel={selectedCustomerLabel}
              />
              <div className="flex justify-end mt-6">
                <Button onClick={handleNext} disabled={!isCustomerValid}>
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="m-0 focus-visible:ring-0">
            <div className="rounded-lg border p-6 shadow-sm bg-card">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">
                  Selección de Productos
                </h2>
                <p className="text-sm text-text-secondary">
                  Agrega los productos a la venta.
                </p>
              </div>
              <SaleProductList
                lines={lines}
                setLines={setLines}
                selectedProductData={selectedProductData}
                setSelectedProductData={setSelectedProductData}
                onAddLine={() => setLines([...lines, createEmptyLine()])}
              />
              <div className="flex justify-between mt-6 pt-4 border-t">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                </Button>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold">
                    Total:{" "}
                    {formatPrice(totalSale, { minimumFractionDigits: 0 })}
                  </div>
                  <Button onClick={handleNext} disabled={!isProductsValid}>
                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="m-0 focus-visible:ring-0">
            <div className="rounded-lg border p-6 shadow-sm bg-card">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Registro de Pagos</h2>
                <p className="text-sm text-text-secondary">
                  Registra los métodos de pago.
                </p>
              </div>
              <SalePaymentSection
                totalToPay={totalSale}
                payments={payments}
                setPayments={setPayments}
                hayProductoBajoCosto={hayProductoBajoCosto}
              />
              <div className="flex justify-between mt-6 pt-4 border-t">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="min-w-[140px]"
                  >
                    {isPending ? (
                      "Procesando..."
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Finalizar
                        Venta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

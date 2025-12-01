"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectSkeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { getPaymentMethods } from "../actions/get-payment-methods";

type PaymentMethod = Awaited<ReturnType<typeof getPaymentMethods>>[number];

export interface Payment {
  id: string;
  methodId: string;
  amount: number;
}

interface SalePaymentSectionProps {
  totalToPay: number;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  hayProductoBajoCosto?: boolean;
}

export function SalePaymentSection({
  totalToPay,
  payments,
  setPayments,
  hayProductoBajoCosto = false,
}: SalePaymentSectionProps) {
  const baseId = useId();
  const idCounterRef = useRef(0);

  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } =
    useQuery<PaymentMethod[]>({
      queryKey: ["payment-methods"],
      queryFn: getPaymentMethods,
    });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalToPay - totalPaid;

  const handleAddPayment = () => {
    idCounterRef.current += 1;
    // Default to remaining amount if positive, otherwise 0
    const defaultAmount = remaining > 0 ? remaining : 0;

    setPayments([
      ...payments,
      {
        id: `${baseId}-payment-${idCounterRef.current}`,
        methodId: "",
        amount: defaultAmount,
      },
    ]);
  };

  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  const handleMethodChange = (id: string, methodId: string) => {
    setPayments(payments.map((p) => (p.id === id ? { ...p, methodId } : p)));
  };

  const handleAmountChange = (id: string, amountStr: string) => {
    const amount = parseFloat(amountStr);
    if (Number.isNaN(amount) || amount < 0) return;

    setPayments(payments.map((p) => (p.id === id ? { ...p, amount } : p)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Pagos</h3>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddPayment}
          disabled={remaining <= 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Pago
        </Button>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end rounded-lg border border-border/60 bg-surface-1 p-4"
          >
            <div className="sm:col-span-12 md:col-span-5">
              <div className="text-sm font-medium mb-1.5 block">
                Método de Pago
              </div>
              {isLoadingPaymentMethods ? (
                <SelectSkeleton />
              ) : (
                <Select
                  value={payment.methodId}
                  onValueChange={(val) => handleMethodChange(payment.id, val)}
                >
                  <SelectTrigger>
                    <span className="truncate">
                      {payment.methodId
                        ? (paymentMethods.find((m) => m.id === payment.methodId)
                            ?.nombre ?? "Seleccionar método")
                        : "Seleccionar método"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="sm:col-span-12 md:col-span-5">
              <div className="text-sm font-medium mb-1.5 block">Monto</div>
              <CurrencyInput
                value={payment.amount.toString()}
                onChange={(val) => handleAmountChange(payment.id, val)}
              />
            </div>

            <div className="sm:col-span-12 md:col-span-2 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemovePayment(payment.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <div className="text-center py-8 text-text-secondary border rounded-lg border-dashed">
            No hay pagos registrados. Agrega uno para continuar.
          </div>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t">
        {hayProductoBajoCosto && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
            ⚠️ Venta no aprobada: hay productos con precio inferior al costo
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span>Total a Pagar:</span>
          <span className="font-medium">
            {formatPrice(totalToPay, { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total Pagado:</span>
          <span className="font-medium text-success">
            {formatPrice(totalPaid, { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Pendiente:</span>
          <span className={remaining > 0 ? "text-destructive" : "text-success"}>
            {formatPrice(remaining, { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}

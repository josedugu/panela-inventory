"use client";

import { InputSearchDB } from "@/components/ui/input-search-db";
import { searchCustomersAction } from "../actions/search-customers";
import {
  CustomerCreateForm,
  type CustomerFormData,
} from "./customer-create-form";

interface CustomerSearchSectionProps {
  selectedCustomerId: string;
  onCustomerChange: (customerId: string | null) => void;
  onCustomerDataChange: (data: CustomerFormData | null) => void;
  selectedCustomerLabel?: string;
  onCustomerLabelChange?: (label: string) => void;
}

export function CustomerSearchSection({
  selectedCustomerId,
  onCustomerChange,
  onCustomerDataChange,
  selectedCustomerLabel,
  onCustomerLabelChange,
}: CustomerSearchSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-sm font-medium text-text">Cliente *</span>
        <InputSearchDB
          placeholder="Buscar por nombre o cédula"
          value={
            selectedCustomerId
              ? {
                  value: selectedCustomerId,
                  label: selectedCustomerLabel ?? "",
                }
              : undefined
          }
          onChange={(option) => {
            if (option) {
              onCustomerChange(option.value);
              onCustomerLabelChange?.(option.label);
              // Limpiar datos de creación cuando se selecciona un cliente existente
              onCustomerDataChange(null);
            } else {
              onCustomerChange(null);
              onCustomerLabelChange?.("");
            }
          }}
          searchFn={searchCustomersAction}
          queryKeyBase="customers"
        />
      </div>

      {!selectedCustomerId && (
        <CustomerCreateForm onDataChange={onCustomerDataChange} />
      )}
    </div>
  );
}

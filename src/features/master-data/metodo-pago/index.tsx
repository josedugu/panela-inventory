"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { MetodoPagoDTO } from "@/data/repositories/metodo-pago.repository";
import {
  deleteMetodoPagoAction,
  upsertMetodoPagoAction,
} from "@/features/master-data/actions";
import {
  CrudSection,
  type CrudSectionConfig,
} from "@/features/master-data/components/crud-section";
import { getMetodoPagoColumns } from "@/features/master-data/metodo-pago/columns";
import {
  type MetodoPagoFormValues,
  metodoPagoFormSchema,
} from "@/features/master-data/metodo-pago/schemas";

interface MetodoPagoSectionProps {
  metodoPagos: MetodoPagoDTO[];
  onRefresh: () => void;
}

function MetodoPagoForm({
  form,
}: {
  form: UseFormReturn<MetodoPagoFormValues>;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="nombre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre *</FormLabel>
            <FormControl>
              <Input placeholder="Nombre del método de pago" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="esCredito"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                ¿Es método de crédito?
              </FormLabel>
              <div className="text-sm text-muted-foreground">
                Marque si este método permite pagos a crédito
              </div>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="comisionAsesor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comisión Asesor (%)</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00 (opcional)"
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir solo números, punto decimal y vacío
                  const cleanedValue = value
                    .replace(/[^0-9.,]/g, "")
                    .replace(/,/g, ".");
                  if (cleanedValue === "" || cleanedValue === ".") {
                    field.onChange("");
                  } else {
                    const numericValue = parseFloat(cleanedValue);
                    field.onChange(
                      Number.isNaN(numericValue) ? "" : numericValue.toString(),
                    );
                  }
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="comisionPlataforma"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comisión Plataforma (%)</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00 (opcional)"
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir solo números, punto decimal y vacío
                  const cleanedValue = value
                    .replace(/[^0-9.,]/g, "")
                    .replace(/,/g, ".");
                  if (cleanedValue === "" || cleanedValue === ".") {
                    field.onChange("");
                  } else {
                    const numericValue = parseFloat(cleanedValue);
                    field.onChange(
                      Number.isNaN(numericValue) ? "" : numericValue.toString(),
                    );
                  }
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function MetodoPagoSection({
  metodoPagos,
  onRefresh,
}: MetodoPagoSectionProps) {
  const config: CrudSectionConfig<MetodoPagoDTO, MetodoPagoFormValues> = {
    title: "Métodos de Pago",
    entityName: "metodoPago",
    getItemId: (metodoPago) => metodoPago.id,
    getItemName: (metodoPago) => metodoPago.nombre,

    columns: getMetodoPagoColumns,
    searchableFields: [(metodoPago) => metodoPago.nombre],

    formSchema: metodoPagoFormSchema,
    defaultFormValues: {
      nombre: "",
      esCredito: false,
      comisionAsesor: "",
      comisionPlataforma: "",
    },
    getFormValuesForEdit: (metodoPago) => ({
      nombre: metodoPago.nombre,
      esCredito: metodoPago.esCredito,
      comisionAsesor: metodoPago.comisionAsesor?.toString() ?? "",
      comisionPlataforma: metodoPago.comisionPlataforma?.toString() ?? "",
    }),

    upsertAction: upsertMetodoPagoAction,
    deleteAction: deleteMetodoPagoAction,

    successMessages: {
      create: "Método de pago agregado exitosamente",
      update: "Método de pago actualizado exitosamente",
      delete: "Método de pago eliminado exitosamente",
    },
    errorMessages: {
      create: "Error al guardar el método de pago",
      update: "Error al actualizar el método de pago",
      delete: "Error al eliminar el método de pago",
    },
  };

  return (
    <CrudSection
      items={metodoPagos}
      config={config}
      onRefresh={onRefresh}
      renderForm={(form) => <MetodoPagoForm form={form} />}
    />
  );
}

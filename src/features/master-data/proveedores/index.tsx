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
import { Textarea } from "@/components/ui/textarea";
import type { SupplierDTO } from "@/data/repositories/suppliers.repository";
import {
  deleteSupplierAction,
  upsertSupplierAction,
} from "@/features/master-data/actions";
import {
  CrudSection,
  type CrudSectionConfig,
} from "@/features/master-data/components/crud-section";
import { getSupplierColumns } from "@/features/master-data/proveedores/columns";
import {
  type SupplierFormValues,
  supplierFormSchema,
} from "@/features/master-data/proveedores/schemas";

interface SuppliersSectionProps {
  suppliers: SupplierDTO[];
  onRefresh: () => void;
}

export function SuppliersSection({
  suppliers,
  onRefresh,
}: SuppliersSectionProps) {
  const config: CrudSectionConfig<SupplierDTO, SupplierFormValues> = {
    title: "Proveedores",
    entityName: "proveedor",
    getItemId: (supplier) => supplier.id,
    getItemName: (supplier) => supplier.nombre,
    columns: getSupplierColumns,
    formSchema: supplierFormSchema,
    defaultFormValues: {
      nombre: "",
      contacto: "",
      email: "",
      telefono: "",
      direccion: "",
    },
    upsertAction: upsertSupplierAction,
    deleteAction: deleteSupplierAction,

    successMessages: {
      create: "Proveedor agregado",
      update: "Proveedor actualizado",
      delete: "Proveedor eliminado",
    },
    errorMessages: {
      create: "Error al guardar el proveedor",
      update: "Error al actualizar el proveedor",
      delete: "Error al eliminar el proveedor",
    },

    searchableFields: [
      (supplier) => supplier.nombre,
      (supplier) => supplier.contacto,
      (supplier) => supplier.email,
      (supplier) => supplier.telefono,
      (supplier) => supplier.direccion ?? "",
    ],
  };

  return (
    <CrudSection
      items={suppliers}
      config={config}
      onRefresh={onRefresh}
      renderForm={(form: UseFormReturn<SupplierFormValues>) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del proveedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona de contacto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del contacto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@ejemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono *</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono de contacto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="direccion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Dirección del proveedor"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    />
  );
}

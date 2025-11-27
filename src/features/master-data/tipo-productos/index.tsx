"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TipoProductoDTO } from "@/data/repositories/shared.repository";
import {
  deleteTipoProductoAction,
  upsertTipoProductoAction,
} from "@/features/master-data/actions/tipo-producto.actions";
import {
  CrudSection,
  type CrudSectionConfig,
} from "@/features/master-data/components/crud-section";
import { getTipoProductoColumns } from "@/features/master-data/tipo-productos/columns";
import {
  type TipoProductoFormValues,
  tipoProductoFormSchema,
} from "@/features/master-data/tipo-productos/schemas";

interface TipoProductosSectionProps {
  tipoProductos: TipoProductoDTO[];
  onRefresh: () => void;
}

export function TipoProductosSection({
  tipoProductos,
  onRefresh,
}: TipoProductosSectionProps) {
  const config: CrudSectionConfig<TipoProductoDTO, TipoProductoFormValues> = {
    title: "Tipos de Producto",
    entityName: "tipo de producto",
    getItemId: (tipo) => tipo.id,
    getItemName: (tipo) => tipo.nombre,
    columns: getTipoProductoColumns,
    formSchema: tipoProductoFormSchema,
    defaultFormValues: {
      nombre: "",
      descripcion: "",
      productoBaseParaOferta: false,
    },
    upsertAction: upsertTipoProductoAction,
    deleteAction: deleteTipoProductoAction,

    successMessages: {
      create: "Tipo de producto agregado",
      update: "Tipo de producto actualizado",
      delete: "Tipo de producto eliminado",
    },
    errorMessages: {
      create: "Error al guardar el tipo de producto",
      update: "Error al actualizar el tipo de producto",
      delete: "Error al eliminar el tipo de producto",
    },

    searchableFields: [(tipo) => tipo.nombre, (tipo) => tipo.descripcion ?? ""],
  };

  return (
    <CrudSection
      items={tipoProductos}
      config={config}
      onRefresh={onRefresh}
      renderForm={(form: UseFormReturn<TipoProductoFormValues>) => (
        <>
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del tipo de producto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Descripción del tipo de producto"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productoBaseParaOferta"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Activa ofertas</FormLabel>
                  <FormDescription>
                    Al vender este tipo de producto, otros productos con precio
                    de oferta se venderán a ese precio especial
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </>
      )}
    />
  );
}

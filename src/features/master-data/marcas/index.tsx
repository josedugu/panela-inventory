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
import type { BrandDTO } from "@/data/repositories/shared.repository";
import {
  deleteBrandAction,
  upsertBrandAction,
} from "@/features/master-data/actions";
import {
  CrudSection,
  type CrudSectionConfig,
} from "@/features/master-data/components/crud-section";
import { getBrandColumns } from "@/features/master-data/marcas/columns";
import {
  type BrandFormValues,
  brandFormSchema,
} from "@/features/master-data/marcas/schemas";

interface BrandsSectionProps {
  brands: BrandDTO[];
  onRefresh: () => void;
}

function BrandForm({ form }: { form: UseFormReturn<BrandFormValues> }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la marca" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="descripcion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Descripción de la marca"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function BrandsSection({ brands, onRefresh }: BrandsSectionProps) {
  const config: CrudSectionConfig<BrandDTO, BrandFormValues> = {
    title: "Marcas",
    entityName: "marca",
    getItemId: (brand) => brand.id,
    getItemName: (brand) => brand.nombre,

    columns: getBrandColumns,
    searchableFields: [
      (brand) => brand.nombre,
      (brand) => brand.descripcion ?? "",
    ],

    formSchema: brandFormSchema,
    defaultFormValues: {
      nombre: "",
      descripcion: "",
    },
    getFormValuesForEdit: (brand) => ({
      nombre: brand.nombre,
      descripcion: brand.descripcion ?? "",
    }),

    upsertAction: upsertBrandAction,
    deleteAction: deleteBrandAction,

    successMessages: {
      create: "Marca agregada exitosamente",
      update: "Marca actualizada exitosamente",
      delete: "Marca eliminada exitosamente",
    },
    errorMessages: {
      create: "Error al guardar la marca",
      update: "Error al actualizar la marca",
      delete: "Error al eliminar la marca",
    },
  };

  return (
    <CrudSection
      items={brands}
      config={config}
      onRefresh={onRefresh}
      renderForm={(form) => <BrandForm form={form} />}
    />
  );
}

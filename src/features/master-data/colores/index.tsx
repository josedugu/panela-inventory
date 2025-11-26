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
import type { ColorDTO } from "@/data/repositories/shared.repository";
import {
  deleteColorAction,
  upsertColorAction,
} from "@/features/master-data/actions";
import { getColorColumns } from "@/features/master-data/colores/columns";
import {
  type ColorFormValues,
  colorFormSchema,
} from "@/features/master-data/colores/schemas";
import {
  CrudSection,
  type CrudSectionConfig,
} from "@/features/master-data/components/crud-section";

interface ColorsSectionProps {
  colors: ColorDTO[];
  onRefresh: () => void;
}

function ColorForm({ form }: { form: UseFormReturn<ColorFormValues> }) {
  return (
    <FormField
      control={form.control}
      name="nombre"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre *</FormLabel>
          <FormControl>
            <Input placeholder="Nombre del color" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ColorsSection({ colors, onRefresh }: ColorsSectionProps) {
  const config: CrudSectionConfig<ColorDTO, ColorFormValues> = {
    title: "Colores",
    entityName: "color",
    getItemId: (color) => color.id,
    getItemName: (color) => color.nombre,

    columns: getColorColumns,
    searchableFields: [(color) => color.nombre],

    formSchema: colorFormSchema,
    defaultFormValues: {
      nombre: "",
    },
    getFormValuesForEdit: (color) => ({
      nombre: color.nombre,
    }),

    upsertAction: upsertColorAction,
    deleteAction: deleteColorAction,

    successMessages: {
      create: "Color agregado exitosamente",
      update: "Color actualizado exitosamente",
      delete: "Color eliminado exitosamente",
    },
    errorMessages: {
      create: "Error al guardar el color",
      update: "Error al actualizar el color",
      delete: "Error al eliminar el color",
    },
  };

  return (
    <CrudSection
      items={colors}
      config={config}
      onRefresh={onRefresh}
      renderForm={(form) => <ColorForm form={form} />}
    />
  );
}

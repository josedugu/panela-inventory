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
import type { RamDTO } from "@/data/repositories/shared.repository";
import {
  deleteRamAction,
  upsertRamAction,
} from "@/features/master-data/actions";
import {
  CrudSection,
  type CrudSectionConfig,
} from "@/features/master-data/components/crud-section";
import { getRamColumns } from "@/features/master-data/ram/columns";
import {
  type RamFormValues,
  ramFormSchema,
} from "@/features/master-data/ram/schemas";

interface RamSectionProps {
  ramOptions: RamDTO[];
  onRefresh: () => void;
}

function RamForm({ form }: { form: UseFormReturn<RamFormValues> }) {
  return (
    <FormField
      control={form.control}
      name="capacidad"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Capacidad (GB) *</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="Capacidad en GB"
              min={1}
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value) || "")}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function RamSection({ ramOptions, onRefresh }: RamSectionProps) {
  const config: CrudSectionConfig<RamDTO, RamFormValues> = {
    title: "RAM",
    entityName: "configuración de RAM",
    getItemId: (option) => option.id,
    getItemName: (option) => `${option.capacidad} GB`,

    columns: getRamColumns,
    searchableFields: [(option) => option.capacidad.toString()],

    formSchema: ramFormSchema,
    defaultFormValues: {
      capacidad: "",
    },
    getFormValuesForEdit: (option) => ({
      capacidad: option.capacidad.toString(),
    }),

    upsertAction: async (data) => {
      const capacidadNumber = Number.parseInt(data.capacidad.trim(), 10);
      return upsertRamAction({
        id: data.id,
        capacidad: capacidadNumber,
      });
    },
    deleteAction: deleteRamAction,

    successMessages: {
      create: "Configuración de RAM agregada",
      update: "Configuración de RAM actualizada",
      delete: "Configuración de RAM eliminada",
    },
    errorMessages: {
      create: "Error al guardar la configuración de RAM",
      update: "Error al actualizar la configuración de RAM",
      delete: "Error al eliminar la configuración de RAM",
    },
  };

  return (
    <CrudSection
      items={ramOptions}
      config={config}
      onRefresh={onRefresh}
      renderForm={(form) => <RamForm form={form} />}
    />
  );
}

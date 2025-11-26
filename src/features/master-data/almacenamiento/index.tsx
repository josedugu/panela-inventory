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
import type { StorageDTO } from "@/data/repositories/shared.repository";
import {
  deleteStorageAction,
  upsertStorageAction,
} from "@/features/master-data/actions";
import { getStorageColumns } from "@/features/master-data/almacenamiento/columns";
import {
  type StorageFormValues,
  storageFormSchema,
} from "@/features/master-data/almacenamiento/schemas";
import {
  CrudSection,
  type CrudSectionConfig,
} from "@/features/master-data/components/crud-section";

interface StorageSectionProps {
  storageOptions: StorageDTO[];
  onRefresh: () => void;
}

function StorageForm({ form }: { form: UseFormReturn<StorageFormValues> }) {
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

export function StorageSection({
  storageOptions,
  onRefresh,
}: StorageSectionProps) {
  const config: CrudSectionConfig<StorageDTO, StorageFormValues> = {
    title: "Almacenamiento",
    entityName: "configuración de almacenamiento",
    getItemId: (option) => option.id,
    getItemName: (option) => `${option.capacidad} GB`,

    columns: getStorageColumns,
    searchableFields: [(option) => option.capacidad.toString()],

    formSchema: storageFormSchema,
    defaultFormValues: {
      capacidad: "",
    },
    getFormValuesForEdit: (option) => ({
      capacidad: option.capacidad.toString(),
    }),

    upsertAction: async (data) => {
      const capacidadNumber = Number.parseInt(data.capacidad.trim(), 10);
      return upsertStorageAction({
        id: data.id,
        capacidad: capacidadNumber,
      });
    },
    deleteAction: deleteStorageAction,

    successMessages: {
      create: "Configuración de almacenamiento agregada",
      update: "Configuración de almacenamiento actualizada",
      delete: "Configuración de almacenamiento eliminada",
    },
    errorMessages: {
      create: "Error al guardar la configuración",
      update: "Error al actualizar la configuración",
      delete: "Error al eliminar la configuración",
    },
  };

  return (
    <CrudSection
      items={storageOptions}
      config={config}
      onRefresh={onRefresh}
      renderForm={(form) => <StorageForm form={form} />}
    />
  );
}

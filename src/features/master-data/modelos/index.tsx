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
import type { BrandDTO, ModelDTO } from "@/data/repositories/shared.repository";
import {
  deleteModelAction,
  upsertModelAction,
} from "@/features/master-data/actions";
import {
  CrudSection,
  type CrudSectionConfig,
  SelectFormField,
} from "@/features/master-data/components/crud-section";
import { getModelColumns } from "@/features/master-data/modelos/columns";
import {
  type ModelFormValues,
  modelFormSchema,
} from "@/features/master-data/modelos/schemas";

interface ModelsSectionProps {
  models: ModelDTO[];
  brands: BrandDTO[];
  onRefresh: () => void;
}

export function ModelsSection({
  models,
  brands,
  onRefresh,
}: ModelsSectionProps) {
  // Preparar opciones para el select de marcas
  const brandOptions = brands.map((brand) => ({
    value: brand.id,
    label: brand.nombre,
  }));

  const config: CrudSectionConfig<ModelDTO, ModelFormValues> = {
    title: "Modelos",
    entityName: "modelo",
    getItemId: (model) => model.id,
    getItemName: (model) => model.nombre,
    columns: getModelColumns,
    formSchema: modelFormSchema,
    defaultFormValues: {
      nombre: "",
      marcaId: "",
    },
    upsertAction: upsertModelAction,
    deleteAction: deleteModelAction,

    successMessages: {
      create: "Modelo agregado",
      update: "Modelo actualizado",
      delete: "Modelo eliminado",
    },
    errorMessages: {
      create: "Error al guardar el modelo",
      update: "Error al actualizar el modelo",
      delete: "Error al eliminar el modelo",
    },

    selectFields: {
      marcaId: {
        options: brandOptions,
        placeholder: "Selecciona una marca",
      },
    },
    searchableFields: [(model) => model.nombre],
  };

  return (
    <CrudSection
      items={models}
      config={config}
      onRefresh={onRefresh}
      renderForm={(form: UseFormReturn<ModelFormValues>, selectOptions) => (
        <>
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del modelo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectOptions?.marcaId && (
            <SelectFormField
              form={form}
              name="marcaId"
              label="Marca"
              options={selectOptions.marcaId.options}
              placeholder={selectOptions.marcaId.placeholder}
              required
            />
          )}
        </>
      )}
    />
  );
}

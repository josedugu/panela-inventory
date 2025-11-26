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
import type { CostCenterDTO } from "@/data/repositories/shared.repository";
import {
  deleteCostCenterAction,
  upsertCostCenterAction,
} from "@/features/master-data/actions";
import { getCostCenterColumns } from "@/features/master-data/centros-costo/columns";
import {
  type CostCenterFormValues,
  costCenterFormSchema,
} from "@/features/master-data/centros-costo/schemas";
import {
  CrudSection,
  type CrudSectionConfig,
} from "@/features/master-data/components/crud-section";

interface CostCentersSectionProps {
  costCenters: CostCenterDTO[];
  onRefresh: () => void;
}

export function CostCentersSection({
  costCenters,
  onRefresh,
}: CostCentersSectionProps) {
  const config: CrudSectionConfig<CostCenterDTO, CostCenterFormValues> = {
    title: "Centros de Costo",
    entityName: "centro de costo",
    getItemId: (center) => center.id,
    getItemName: (center) => center.nombre,
    columns: getCostCenterColumns,
    formSchema: costCenterFormSchema,
    defaultFormValues: {
      nombre: "",
      descripcion: "",
      responsable: "",
    },
    upsertAction: upsertCostCenterAction,
    deleteAction: deleteCostCenterAction,

    successMessages: {
      create: "Centro de costo agregado",
      update: "Centro de costo actualizado",
      delete: "Centro de costo eliminado",
    },
    errorMessages: {
      create: "Error al guardar el centro de costo",
      update: "Error al actualizar el centro de costo",
      delete: "Error al eliminar el centro de costo",
    },

    searchableFields: [
      (center) => center.nombre,
      (center) => center.descripcion ?? "",
      (center) => center.responsable ?? "",
    ],
  };

  return (
    <CrudSection
      items={costCenters}
      config={config}
      onRefresh={onRefresh}
      renderForm={(form: UseFormReturn<CostCenterFormValues>) => (
        <>
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del centro de costo" {...field} />
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
                    placeholder="Descripción del centro de costo"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responsable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del responsable" {...field} />
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

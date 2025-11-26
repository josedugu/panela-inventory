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
import type { CostCenterDTO } from "@/data/repositories/shared.repository";
import type { WarehouseDTO } from "@/data/repositories/warehouses.repository";
import {
  deleteWarehouseAction,
  upsertWarehouseAction,
} from "@/features/master-data/actions";
import { getWarehouseColumns } from "@/features/master-data/bodegas/columns";
import {
  type WarehouseFormValues,
  warehouseFormSchema,
} from "@/features/master-data/bodegas/schemas";
import {
  CrudSection,
  type CrudSectionConfig,
  SelectFormField,
} from "@/features/master-data/components/crud-section";

interface WarehousesSectionProps {
  warehouses: WarehouseDTO[];
  costCenters: CostCenterDTO[];
  onRefresh: () => void;
}

export function WarehousesSection({
  warehouses,
  costCenters,
  onRefresh,
}: WarehousesSectionProps) {
  // Preparar opciones para el select de centros de costo
  const costCenterOptions = [
    { value: "", label: "Sin centro asignado" },
    ...costCenters.map((center) => ({
      value: center.id,
      label: center.nombre,
    })),
  ];

  const config: CrudSectionConfig<WarehouseDTO, WarehouseFormValues> = {
    title: "Bodegas",
    entityName: "bodega",
    getItemId: (warehouse) => warehouse.id,
    getItemName: (warehouse) => warehouse.nombre,
    columns: getWarehouseColumns,
    formSchema: warehouseFormSchema,
    defaultFormValues: {
      codigo: "",
      nombre: "",
      centroCostoId: "",
    },
    upsertAction: upsertWarehouseAction,
    deleteAction: deleteWarehouseAction,

    successMessages: {
      create: "Bodega agregada",
      update: "Bodega actualizada",
      delete: "Bodega eliminada",
    },
    errorMessages: {
      create: "Error al guardar la bodega",
      update: "Error al actualizar la bodega",
      delete: "Error al eliminar la bodega",
    },

    selectFields: {
      centroCostoId: {
        options: costCenterOptions,
        placeholder: "Sin centro asignado",
      },
    },
    searchableFields: [
      (warehouse) => warehouse.nombre,
      (warehouse) => warehouse.codigo,
    ],
  };

  return (
    <CrudSection
      items={warehouses}
      config={config}
      onRefresh={onRefresh}
      renderForm={(form: UseFormReturn<WarehouseFormValues>, selectOptions) => (
        <>
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input placeholder="Código de la bodega" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la bodega" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectOptions?.centroCostoId && (
            <SelectFormField
              form={form}
              name="centroCostoId"
              label="Centro de Costo"
              options={selectOptions.centroCostoId.options}
              placeholder={selectOptions.centroCostoId.placeholder}
            />
          )}
        </>
      )}
    />
  );
}

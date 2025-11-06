"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import type {
  BrandDTO,
  ColorDTO,
  CostCenterDTO,
  ModelDTO,
  RamDTO,
  StorageDTO,
  SupplierDTO,
  UserDTO,
  WarehouseDTO,
} from "@/data/repositories/master-data.repository";
import { StorageSection } from "@/features/master-data/almacenamiento";
import { WarehousesSection } from "@/features/master-data/bodegas";
import { CostCentersSection } from "@/features/master-data/centros-costo";
import { ColorsSection } from "@/features/master-data/colores";
import type { MasterDataSection } from "@/features/master-data/conts";
import { BrandsSection } from "@/features/master-data/marcas";
import { ModelsSection } from "@/features/master-data/modelos";
import { SuppliersSection } from "@/features/master-data/proveedores";
import { RamSection } from "@/features/master-data/ram";
import { UsersSection } from "@/features/master-data/usuarios";

interface MasterDataScreenData {
  suppliers?: SupplierDTO[];
  brands?: BrandDTO[];
  models?: ModelDTO[];
  users?: UserDTO[];
  costCenters?: CostCenterDTO[];
  warehouses?: WarehouseDTO[];
  colors?: ColorDTO[];
  storageOptions?: StorageDTO[];
  ramOptions?: RamDTO[];
}

type SectionRenderer = (props: {
  suppliers?: SupplierDTO[];
  brands?: BrandDTO[];
  models?: ModelDTO[];
  users?: UserDTO[];
  costCenters?: CostCenterDTO[];
  warehouses?: WarehouseDTO[];
  colors?: ColorDTO[];
  storageOptions?: StorageDTO[];
  ramOptions?: RamDTO[];
  onRefresh: () => void;
}) => React.ReactNode;

const SECTION_RENDERERS: Record<MasterDataSection, SectionRenderer> = {
  proveedores: ({ suppliers = [], onRefresh }) => (
    <SuppliersSection suppliers={suppliers} onRefresh={onRefresh} />
  ),
  marcas: ({ brands = [], onRefresh }) => (
    <BrandsSection brands={brands} onRefresh={onRefresh} />
  ),
  modelos: ({ models = [], brands = [], onRefresh }) => (
    <ModelsSection models={models} brands={brands} onRefresh={onRefresh} />
  ),
  usuarios: ({ users = [], costCenters = [], onRefresh }) => (
    <UsersSection
      users={users}
      costCenters={costCenters}
      onRefresh={onRefresh}
    />
  ),
  "centros-costo": ({ costCenters = [], onRefresh }) => (
    <CostCentersSection costCenters={costCenters} onRefresh={onRefresh} />
  ),
  bodegas: ({ warehouses = [], onRefresh }) => (
    <WarehousesSection warehouses={warehouses} onRefresh={onRefresh} />
  ),
  colores: ({ colors = [], onRefresh }) => (
    <ColorsSection colors={colors} onRefresh={onRefresh} />
  ),
  almacenamiento: ({ storageOptions = [], onRefresh }) => (
    <StorageSection storageOptions={storageOptions} onRefresh={onRefresh} />
  ),
  ram: ({ ramOptions = [], onRefresh }) => (
    <RamSection ramOptions={ramOptions} onRefresh={onRefresh} />
  ),
};

interface MasterDataScreenProps {
  section: MasterDataSection;
  data: MasterDataScreenData;
}

export function MasterDataScreen({ section, data }: MasterDataScreenProps) {
  const router = useRouter();

  const suppliers = data.suppliers ?? [];
  const brands = data.brands ?? [];
  const models = data.models ?? [];
  const users = data.users ?? [];
  const costCenters = data.costCenters ?? [];
  const warehouses = data.warehouses ?? [];
  const colors = data.colors ?? [];
  const storageOptions = data.storageOptions ?? [];
  const ramOptions = data.ramOptions ?? [];

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const sectionContent = useMemo(() => {
    const render = SECTION_RENDERERS[section];
    if (!render) return null;
    return render({
      suppliers,
      brands,
      models,
      users,
      costCenters,
      warehouses,
      colors,
      storageOptions,
      ramOptions,
      onRefresh: handleRefresh,
    });
  }, [
    brands,
    colors,
    costCenters,
    handleRefresh,
    models,
    section,
    storageOptions,
    suppliers,
    users,
    warehouses,
    ramOptions,
  ]);

  return <>{sectionContent}</>;
}

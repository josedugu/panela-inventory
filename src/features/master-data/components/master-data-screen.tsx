"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { ProductDTO } from "@/data/repositories/master.products.repository";
import type {
  BrandDTO,
  ColorDTO,
  CostCenterDTO,
  ModelDTO,
  RamDTO,
  StorageDTO,
  TipoProductoDTO,
} from "@/data/repositories/shared.repository";
import type { SupplierDTO } from "@/data/repositories/suppliers.repository";
import type { RoleDTO, UserDTO } from "@/data/repositories/users.repository";
import type { WarehouseDTO } from "@/data/repositories/warehouses.repository";
import { StorageSection } from "@/features/master-data/almacenamiento";
import { WarehousesSection } from "@/features/master-data/bodegas";
import { CostCentersSection } from "@/features/master-data/centros-costo";
import { ColorsSection } from "@/features/master-data/colores";
import type { MasterDataSection } from "@/features/master-data/conts";
import { BrandsSection } from "@/features/master-data/marcas";
import { ModelsSection } from "@/features/master-data/modelos";
import { ProductsSection } from "@/features/master-data/productos";
import { SuppliersSection } from "@/features/master-data/proveedores";
import { RamSection } from "@/features/master-data/ram";
import { TipoProductosSection } from "@/features/master-data/tipo-productos";
import { UsersSection } from "@/features/master-data/usuarios";

interface MasterDataScreenData {
  suppliers?: SupplierDTO[];
  brands?: BrandDTO[];
  models?: ModelDTO[];
  users?: UserDTO[];
  roles?: RoleDTO[];
  costCenters?: CostCenterDTO[];
  warehouses?: WarehouseDTO[];
  colors?: ColorDTO[];
  storageOptions?: StorageDTO[];
  ramOptions?: RamDTO[];
  tipoProductos?: TipoProductoDTO[];
  products?: ProductDTO[];
}

type SectionRenderer = (props: {
  suppliers?: SupplierDTO[];
  brands?: BrandDTO[];
  models?: ModelDTO[];
  users?: UserDTO[];
  roles?: RoleDTO[];
  costCenters?: CostCenterDTO[];
  warehouses?: WarehouseDTO[];
  colors?: ColorDTO[];
  storageOptions?: StorageDTO[];
  ramOptions?: RamDTO[];
  tipoProductos?: TipoProductoDTO[];
  products?: ProductDTO[];
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
  usuarios: ({ users = [], costCenters = [], roles = [], onRefresh }) => (
    <UsersSection
      users={users}
      costCenters={costCenters}
      roles={roles}
      onRefresh={onRefresh}
    />
  ),
  "centros-costo": ({ costCenters = [], onRefresh }) => (
    <CostCentersSection costCenters={costCenters} onRefresh={onRefresh} />
  ),
  bodegas: ({ warehouses = [], costCenters = [], onRefresh }) => (
    <WarehousesSection
      warehouses={warehouses}
      costCenters={costCenters}
      onRefresh={onRefresh}
    />
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
  "tipo-productos": ({ tipoProductos = [], onRefresh }) => (
    <TipoProductosSection tipoProductos={tipoProductos} onRefresh={onRefresh} />
  ),
  productos: ({
    products = [],
    tipoProductos = [],
    brands = [],
    models = [],
    storageOptions = [],
    ramOptions = [],
    colors = [],
    onRefresh,
  }) => (
    <ProductsSection
      products={products}
      tipoProductos={tipoProductos}
      brands={brands}
      models={models}
      storageOptions={storageOptions}
      ramOptions={ramOptions}
      colors={colors}
      onRefresh={onRefresh}
    />
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
  const roles = data.roles ?? [];
  const costCenters = data.costCenters ?? [];
  const warehouses = data.warehouses ?? [];
  const colors = data.colors ?? [];
  const storageOptions = data.storageOptions ?? [];
  const ramOptions = data.ramOptions ?? [];
  const tipoProductos = data.tipoProductos ?? [];
  const products = data.products ?? [];

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
      roles,
      costCenters,
      warehouses,
      colors,
      storageOptions,
      ramOptions,
      tipoProductos,
      products,
      onRefresh: handleRefresh,
    });
  }, [
    brands,
    colors,
    costCenters,
    handleRefresh,
    models,
    products,
    ramOptions,
    roles,
    section,
    storageOptions,
    suppliers,
    tipoProductos,
    users,
    warehouses,
  ]);

  return <>{sectionContent}</>;
}

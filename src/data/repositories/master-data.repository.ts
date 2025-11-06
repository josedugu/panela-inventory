import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export interface SupplierDTO {
  id: string;
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandDTO {
  id: string;
  nombre: string;
  descripcion?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelDTO {
  id: string;
  nombre: string;
  marcaId: string;
  marcaNombre: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostCenterDTO {
  id: string;
  nombre: string;
  descripcion?: string | null;
  responsable?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarehouseDTO {
  id: string;
  codigo: string;
  nombre: string;
  capacidad?: string | null;
  responsable?: string | null;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDTO {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  rolNombre?: string | null;
  centroCostoId?: string | null;
  centroCostoNombre?: string | null;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorDTO {
  id: string;
  nombre: string;
  codigoHex: string;
  descripcion?: string | null;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageDTO {
  id: string;
  capacidad: string;
  tipo?: string | null;
  descripcion?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RamDTO {
  id: string;
  capacidad: string;
  tipo?: string | null;
  velocidad?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function listSuppliers(): Promise<SupplierDTO[]> {
  const suppliers = await prisma.proveedor.findMany({
    orderBy: { createdAt: "desc" },
  });

  return suppliers.map((supplier) => ({
    id: supplier.id,
    nombre: supplier.nombre,
    contacto: supplier.contacto,
    email: supplier.email,
    telefono: supplier.telefono,
    direccion: supplier.direccion,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  }));
}

interface SupplierInput {
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion?: string | null;
}

export async function createSupplier(
  input: SupplierInput,
): Promise<SupplierDTO> {
  const supplier = await prisma.proveedor.create({
    data: {
      nombre: input.nombre,
      contacto: input.contacto,
      email: input.email,
      telefono: input.telefono,
      direccion: input.direccion,
    },
  });

  return {
    id: supplier.id,
    nombre: supplier.nombre,
    contacto: supplier.contacto,
    email: supplier.email,
    telefono: supplier.telefono,
    direccion: supplier.direccion,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}

export async function updateSupplier(
  id: string,
  input: SupplierInput,
): Promise<SupplierDTO> {
  const supplier = await prisma.proveedor.update({
    where: { id },
    data: {
      nombre: input.nombre,
      contacto: input.contacto,
      email: input.email,
      telefono: input.telefono,
      direccion: input.direccion,
    },
  });

  return {
    id: supplier.id,
    nombre: supplier.nombre,
    contacto: supplier.contacto,
    email: supplier.email,
    telefono: supplier.telefono,
    direccion: supplier.direccion,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}

export async function deleteSupplier(id: string): Promise<void> {
  await prisma.proveedor.delete({
    where: { id },
  });
}

export async function listBrands(): Promise<BrandDTO[]> {
  const brands = await prisma.marca.findMany({
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return brands.map((brand) => ({
    id: brand.id,
    nombre: brand.nombre,
    descripcion: brand.descripcion,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  }));
}

interface BrandInput {
  nombre: string;
  descripcion?: string | null;
}

export async function createBrand(input: BrandInput): Promise<BrandDTO> {
  const brand = await prisma.marca.create({
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion,
    },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    id: brand.id,
    nombre: brand.nombre,
    descripcion: brand.descripcion,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}

export async function updateBrand(
  id: string,
  input: BrandInput,
): Promise<BrandDTO> {
  const brand = await prisma.marca.update({
    where: { id },
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion,
    },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    id: brand.id,
    nombre: brand.nombre,
    descripcion: brand.descripcion,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}

export async function deleteBrand(id: string): Promise<void> {
  await prisma.marca.delete({
    where: { id },
  });
}

export async function listModels(): Promise<ModelDTO[]> {
  const models = await prisma.modelo.findMany({
    include: {
      marca: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return models.map((model) => ({
    id: model.id,
    nombre: model.nombre,
    marcaId: model.marcaId,
    marcaNombre: model.marca.nombre,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  }));
}

interface ModelInput {
  nombre: string;
  marcaId: string;
}

export async function createModel(input: ModelInput): Promise<ModelDTO> {
  const model = await prisma.modelo.create({
    data: {
      nombre: input.nombre,
      marcaId: input.marcaId,
    },
    include: {
      marca: true,
    },
  });

  return {
    id: model.id,
    nombre: model.nombre,
    marcaId: model.marcaId,
    marcaNombre: model.marca.nombre,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export async function updateModel(
  id: string,
  input: ModelInput,
): Promise<ModelDTO> {
  const model = await prisma.modelo.update({
    where: { id },
    data: {
      nombre: input.nombre,
      marcaId: input.marcaId,
    },
    include: {
      marca: true,
    },
  });

  return {
    id: model.id,
    nombre: model.nombre,
    marcaId: model.marcaId,
    marcaNombre: model.marca.nombre,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export async function deleteModel(id: string): Promise<void> {
  await prisma.modelo.delete({
    where: { id },
  });
}

export async function listCostCenters(): Promise<CostCenterDTO[]> {
  const costCenters = await prisma.centroCostos.findMany({
    orderBy: { createdAt: "desc" },
  });

  return costCenters.map((center) => ({
    id: center.id,
    nombre: center.nombre,
    descripcion: center.descripcion,
    responsable: center.responsable,
    createdAt: center.createdAt,
    updatedAt: center.updatedAt,
  }));
}

interface CostCenterInput {
  nombre: string;
  descripcion?: string | null;
  responsable?: string | null;
}

export async function createCostCenter(
  input: CostCenterInput,
): Promise<CostCenterDTO> {
  const center = await prisma.centroCostos.create({
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion,
      responsable: input.responsable,
    },
  });

  return {
    id: center.id,
    nombre: center.nombre,
    descripcion: center.descripcion,
    responsable: center.responsable,
    createdAt: center.createdAt,
    updatedAt: center.updatedAt,
  };
}

export async function updateCostCenter(
  id: string,
  input: CostCenterInput,
): Promise<CostCenterDTO> {
  const center = await prisma.centroCostos.update({
    where: { id },
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion,
      responsable: input.responsable,
    },
  });

  return {
    id: center.id,
    nombre: center.nombre,
    descripcion: center.descripcion,
    responsable: center.responsable,
    createdAt: center.createdAt,
    updatedAt: center.updatedAt,
  };
}

export async function deleteCostCenter(id: string): Promise<void> {
  await prisma.centroCostos.delete({
    where: { id },
  });
}

export async function listWarehouses(): Promise<WarehouseDTO[]> {
  const warehouses = await prisma.bodega.findMany({
    orderBy: { createdAt: "desc" },
  });

  return warehouses.map((warehouse) => ({
    id: warehouse.id,
    codigo: warehouse.codigo,
    nombre: warehouse.nombre,
    capacidad: warehouse.capacidad,
    responsable: warehouse.responsable,
    estado: warehouse.estado,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  }));
}

interface WarehouseInput {
  codigo: string;
  nombre: string;
  capacidad?: string | null;
  responsable?: string | null;
}

export async function createWarehouse(
  input: WarehouseInput,
): Promise<WarehouseDTO> {
  const warehouse = await prisma.bodega.create({
    data: {
      codigo: input.codigo,
      nombre: input.nombre,
      capacidad: input.capacidad,
      responsable: input.responsable,
    },
  });

  return {
    id: warehouse.id,
    codigo: warehouse.codigo,
    nombre: warehouse.nombre,
    capacidad: warehouse.capacidad,
    responsable: warehouse.responsable,
    estado: warehouse.estado,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  };
}

export async function updateWarehouse(
  id: string,
  input: WarehouseInput,
): Promise<WarehouseDTO> {
  const warehouse = await prisma.bodega.update({
    where: { id },
    data: {
      codigo: input.codigo,
      nombre: input.nombre,
      capacidad: input.capacidad,
      responsable: input.responsable,
    },
  });

  return {
    id: warehouse.id,
    codigo: warehouse.codigo,
    nombre: warehouse.nombre,
    capacidad: warehouse.capacidad,
    responsable: warehouse.responsable,
    estado: warehouse.estado,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  };
}

export async function deleteWarehouse(id: string): Promise<void> {
  await prisma.bodega.delete({
    where: { id },
  });
}

async function findOrCreateRoleId(
  nombre: string,
  tx:
    | Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
    | typeof prisma = prisma,
): Promise<string> {
  const normalized = nombre.trim();

  const role = await tx.rol.upsert({
    where: { nombre: normalized },
    update: {},
    create: {
      nombre: normalized,
    },
  });

  return role.id;
}

export async function listUsers(): Promise<UserDTO[]> {
  const users = await prisma.usuario.findMany({
    include: {
      centroCostos: true,
      rol: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => ({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    rolNombre: user.rol?.nombre ?? null,
    centroCostoId: user.centroCostoId,
    centroCostoNombre: user.centroCostos?.nombre ?? null,
    estado: user.estado,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

interface UserInput {
  nombre: string;
  email: string;
  telefono?: string | null;
  rol: string;
  centroCostoId?: string | null;
  estado?: boolean;
}

export async function createUser(input: UserInput): Promise<UserDTO> {
  const user = await prisma.$transaction(async (tx) => {
    const roleId = await findOrCreateRoleId(input.rol, tx);

    return tx.usuario.create({
      data: {
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        rolId: roleId,
        centroCostoId: input.centroCostoId ?? null,
        estado: input.estado ?? true,
      },
      include: {
        centroCostos: true,
        rol: true,
      },
    });
  });

  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    rolNombre: user.rol?.nombre ?? null,
    centroCostoId: user.centroCostoId,
    centroCostoNombre: user.centroCostos?.nombre ?? null,
    estado: user.estado,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateUser(
  id: string,
  input: UserInput,
): Promise<UserDTO> {
  const user = await prisma.$transaction(async (tx) => {
    const roleId = await findOrCreateRoleId(input.rol, tx);

    return tx.usuario.update({
      where: { id },
      data: {
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        rolId: roleId,
        centroCostoId: input.centroCostoId ?? null,
        estado: input.estado ?? true,
      },
      include: {
        centroCostos: true,
        rol: true,
      },
    });
  });

  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    rolNombre: user.rol?.nombre ?? null,
    centroCostoId: user.centroCostoId,
    centroCostoNombre: user.centroCostos?.nombre ?? null,
    estado: user.estado,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.usuario.delete({
    where: { id },
  });
}

export async function listColors(): Promise<ColorDTO[]> {
  const colors = await prisma.color.findMany({
    orderBy: { createdAt: "desc" },
  });

  return colors.map((color) => ({
    id: color.id,
    nombre: color.nombre,
    codigoHex: color.codigoHex,
    descripcion: color.descripcion,
    estado: color.estado,
    createdAt: color.createdAt,
    updatedAt: color.updatedAt,
  }));
}

interface ColorInput {
  nombre: string;
  codigoHex: string;
  descripcion?: string | null;
  estado?: boolean;
}

export async function createColor(input: ColorInput): Promise<ColorDTO> {
  const color = await prisma.color.create({
    data: {
      nombre: input.nombre,
      codigoHex: input.codigoHex,
      descripcion: input.descripcion,
      estado: input.estado ?? true,
    },
  });

  return {
    id: color.id,
    nombre: color.nombre,
    codigoHex: color.codigoHex,
    descripcion: color.descripcion,
    estado: color.estado,
    createdAt: color.createdAt,
    updatedAt: color.updatedAt,
  };
}

export async function updateColor(
  id: string,
  input: ColorInput,
): Promise<ColorDTO> {
  const color = await prisma.color.update({
    where: { id },
    data: {
      nombre: input.nombre,
      codigoHex: input.codigoHex,
      descripcion: input.descripcion,
      estado: input.estado ?? true,
    },
  });

  return {
    id: color.id,
    nombre: color.nombre,
    codigoHex: color.codigoHex,
    descripcion: color.descripcion,
    estado: color.estado,
    createdAt: color.createdAt,
    updatedAt: color.updatedAt,
  };
}

export async function deleteColor(id: string): Promise<void> {
  await prisma.color.delete({
    where: { id },
  });
}

export async function listStorageOptions(): Promise<StorageDTO[]> {
  const storageOptions = await prisma.almacenamiento.findMany({
    orderBy: { createdAt: "desc" },
  });

  return storageOptions.map((storage) => ({
    id: storage.id,
    capacidad: storage.capacidad,
    tipo: storage.tipo,
    descripcion: storage.descripcion,
    createdAt: storage.createdAt,
    updatedAt: storage.updatedAt,
  }));
}

interface StorageInput {
  capacidad: string;
  tipo?: string | null;
  descripcion?: string | null;
}

export async function createStorageOption(
  input: StorageInput,
): Promise<StorageDTO> {
  const storage = await prisma.almacenamiento.create({
    data: {
      capacidad: input.capacidad,
      tipo: input.tipo,
      descripcion: input.descripcion,
    },
  });

  return {
    id: storage.id,
    capacidad: storage.capacidad,
    tipo: storage.tipo,
    descripcion: storage.descripcion,
    createdAt: storage.createdAt,
    updatedAt: storage.updatedAt,
  };
}

export async function updateStorageOption(
  id: string,
  input: StorageInput,
): Promise<StorageDTO> {
  const storage = await prisma.almacenamiento.update({
    where: { id },
    data: {
      capacidad: input.capacidad,
      tipo: input.tipo,
      descripcion: input.descripcion,
    },
  });

  return {
    id: storage.id,
    capacidad: storage.capacidad,
    tipo: storage.tipo,
    descripcion: storage.descripcion,
    createdAt: storage.createdAt,
    updatedAt: storage.updatedAt,
  };
}

export async function deleteStorageOption(id: string): Promise<void> {
  await prisma.almacenamiento.delete({
    where: { id },
  });
}

export async function listRamOptions(): Promise<RamDTO[]> {
  const rams = await prisma.ram.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rams.map((ram) => ({
    id: ram.id,
    capacidad: ram.capacidad,
    tipo: ram.tipo,
    velocidad: ram.velocidad,
    createdAt: ram.createdAt,
    updatedAt: ram.updatedAt,
  }));
}

interface RamInput {
  capacidad: string;
  tipo?: string | null;
  velocidad?: string | null;
}

export async function createRamOption(input: RamInput): Promise<RamDTO> {
  const ram = await prisma.ram.create({
    data: {
      capacidad: input.capacidad,
      tipo: input.tipo,
      velocidad: input.velocidad,
    },
  });

  return {
    id: ram.id,
    capacidad: ram.capacidad,
    tipo: ram.tipo,
    velocidad: ram.velocidad,
    createdAt: ram.createdAt,
    updatedAt: ram.updatedAt,
  };
}

export async function updateRamOption(
  id: string,
  input: RamInput,
): Promise<RamDTO> {
  const ram = await prisma.ram.update({
    where: { id },
    data: {
      capacidad: input.capacidad,
      tipo: input.tipo,
      velocidad: input.velocidad,
    },
  });

  return {
    id: ram.id,
    capacidad: ram.capacidad,
    tipo: ram.tipo,
    velocidad: ram.velocidad,
    createdAt: ram.createdAt,
    updatedAt: ram.updatedAt,
  };
}

export async function deleteRamOption(id: string): Promise<void> {
  await prisma.ram.delete({
    where: { id },
  });
}

export function isPrismaKnownError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

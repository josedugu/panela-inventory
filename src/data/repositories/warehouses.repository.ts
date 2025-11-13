import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface WarehouseDTO {
  id: string;
  codigo: string;
  nombre: string;
  estado: boolean;
  centroCostoId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface WarehouseInput {
  codigo: string;
  nombre: string;
  centroCostoId?: string | null;
}

export async function listWarehouses(): Promise<WarehouseDTO[]> {
  const warehouses = await prisma.bodega.findMany({
    orderBy: { createdAt: "desc" },
  });

  return warehouses.map((warehouse) => ({
    id: warehouse.id,
    codigo: warehouse.codigo,
    nombre: warehouse.nombre,
    estado: warehouse.estado,
    centroCostoId: warehouse.centroCostoId,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  }));
}

export async function createWarehouse(
  input: WarehouseInput,
): Promise<WarehouseDTO> {
  const warehouse = await prisma.bodega.create({
    data: {
      codigo: input.codigo,
      nombre: input.nombre,
      centroCostoId: input.centroCostoId || undefined,
    },
  });

  return {
    id: warehouse.id,
    codigo: warehouse.codigo,
    nombre: warehouse.nombre,
    estado: warehouse.estado,
    centroCostoId: warehouse.centroCostoId,
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
      centroCostoId: input.centroCostoId || undefined,
    },
  });

  return {
    id: warehouse.id,
    codigo: warehouse.codigo,
    nombre: warehouse.nombre,
    estado: warehouse.estado,
    centroCostoId: warehouse.centroCostoId,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  };
}

export async function deleteWarehouse(id: string): Promise<void> {
  await prisma.bodega.delete({
    where: { id },
  });
}

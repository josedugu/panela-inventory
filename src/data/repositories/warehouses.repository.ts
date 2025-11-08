import "server-only";

import { prisma } from "@/lib/prisma/client";

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

interface WarehouseInput {
  codigo: string;
  nombre: string;
  capacidad?: string | null;
  responsable?: string | null;
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

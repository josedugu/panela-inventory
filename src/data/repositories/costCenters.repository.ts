import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface CostCenterDTO {
  id: string;
  nombre: string;
  descripcion?: string | null;
  responsable?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CostCenterInput {
  nombre: string;
  descripcion?: string | null;
  responsable?: string | null;
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

export async function createCostCenter(input: CostCenterInput) {
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

export async function updateCostCenter(id: string, input: CostCenterInput) {
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

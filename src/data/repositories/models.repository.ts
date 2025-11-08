import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface ModelDTO {
  id: string;
  nombre: string;
  marcaId: string;
  marcaNombre: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ModelInput {
  nombre: string;
  marcaId: string;
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

export async function createModel(input: ModelInput) {
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

export async function updateModel(id: string, input: ModelInput) {
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

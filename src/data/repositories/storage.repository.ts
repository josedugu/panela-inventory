import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface StorageDTO {
  id: string;
  capacidad: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StorageInput {
  capacidad: number;
}

export async function listStorageOptions(): Promise<StorageDTO[]> {
  const storageOptions = await prisma.almacenamiento.findMany({
    orderBy: { createdAt: "desc" },
  });

  return storageOptions.map((storage) => ({
    id: storage.id,
    capacidad: Number(storage.capacidad),
    createdAt: storage.createdAt,
    updatedAt: storage.updatedAt,
  }));
}

export async function createStorageOption(input: StorageInput) {
  const storage = await prisma.almacenamiento.create({
    data: {
      capacidad: input.capacidad,
    },
  });

  return {
    id: storage.id,
    capacidad: Number(storage.capacidad),
    createdAt: storage.createdAt,
    updatedAt: storage.updatedAt,
  };
}

export async function updateStorageOption(id: string, input: StorageInput) {
  const storage = await prisma.almacenamiento.update({
    where: { id },
    data: {
      capacidad: input.capacidad,
    },
  });

  return {
    id: storage.id,
    capacidad: Number(storage.capacidad),
    createdAt: storage.createdAt,
    updatedAt: storage.updatedAt,
  };
}

export async function deleteStorageOption(id: string): Promise<void> {
  await prisma.almacenamiento.delete({
    where: { id },
  });
}

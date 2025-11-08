import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface RamDTO {
  id: string;
  capacidad: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RamInput {
  capacidad: number;
}

export async function listRamOptions(): Promise<RamDTO[]> {
  const rams = await prisma.ram.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rams.map((ram) => ({
    id: ram.id,
    capacidad: Number(ram.capacidad),
    createdAt: ram.createdAt,
    updatedAt: ram.updatedAt,
  }));
}

export async function createRamOption(input: RamInput) {
  const ram = await prisma.ram.create({
    data: {
      capacidad: input.capacidad,
    },
  });

  return {
    id: ram.id,
    capacidad: Number(ram.capacidad),
    createdAt: ram.createdAt,
    updatedAt: ram.updatedAt,
  };
}

export async function updateRamOption(id: string, input: RamInput) {
  const ram = await prisma.ram.update({
    where: { id },
    data: {
      capacidad: input.capacidad,
    },
  });

  return {
    id: ram.id,
    capacidad: Number(ram.capacidad),
    createdAt: ram.createdAt,
    updatedAt: ram.updatedAt,
  };
}

export async function deleteRamOption(id: string): Promise<void> {
  await prisma.ram.delete({
    where: { id },
  });
}

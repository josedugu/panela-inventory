import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface ColorDTO {
  id: string;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ColorInput {
  nombre: string;
}

export async function listColors(): Promise<ColorDTO[]> {
  const colors = await prisma.color.findMany({
    orderBy: { createdAt: "desc" },
  });

  return colors.map((color) => ({
    id: color.id,
    nombre: color.nombre,
    createdAt: color.createdAt,
    updatedAt: color.updatedAt,
  }));
}

export async function createColor(input: ColorInput) {
  const color = await prisma.color.create({
    data: {
      nombre: input.nombre,
    },
  });

  return {
    id: color.id,
    nombre: color.nombre,
    createdAt: color.createdAt,
    updatedAt: color.updatedAt,
  };
}

export async function updateColor(id: string, input: ColorInput) {
  const color = await prisma.color.update({
    where: { id },
    data: {
      nombre: input.nombre,
    },
  });

  return {
    id: color.id,
    nombre: color.nombre,
    createdAt: color.createdAt,
    updatedAt: color.updatedAt,
  };
}

export async function deleteColor(id: string): Promise<void> {
  await prisma.color.delete({
    where: { id },
  });
}

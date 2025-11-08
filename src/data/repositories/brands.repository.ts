import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface BrandDTO {
  id: string;
  nombre: string;
  descripcion?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BrandInput {
  nombre: string;
  descripcion?: string | null;
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

export async function createBrand(input: BrandInput) {
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

export async function updateBrand(id: string, input: BrandInput) {
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

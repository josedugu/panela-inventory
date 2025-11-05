import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export async function getAllCategories() {
  return prisma.tipoProducto.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function getCategoryById(id: string) {
  return prisma.tipoProducto.findUnique({
    where: { id },
  });
}

type CreateCategoryInput = Pick<
  Prisma.TipoProductoUncheckedCreateInput,
  "nombre" | "descripcion"
>;

export async function createCategory(tipoProductoData: CreateCategoryInput) {
  return prisma.tipoProducto.create({
    data: tipoProductoData,
  });
}

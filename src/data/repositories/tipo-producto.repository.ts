import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface TipoProductoDTO {
  id: string;
  nombre: string;
  descripcion?: string | null;
  productoBaseParaOferta: boolean;
  createdAt: Date;
}

interface TipoProductoInput {
  nombre: string;
  descripcion?: string | null;
  productoBaseParaOferta?: boolean;
}

export async function listTipoProductos(): Promise<TipoProductoDTO[]> {
  const tipos = await prisma.tipoProducto.findMany({
    orderBy: { nombre: "asc" },
  });

  return tipos.map((tipo) => ({
    id: tipo.id,
    nombre: tipo.nombre,
    descripcion: tipo.descripcion,
    productoBaseParaOferta: tipo.productoBaseParaOferta,
    createdAt: tipo.createdAt,
  }));
}

export async function createTipoProducto(input: TipoProductoInput) {
  const tipo = await prisma.tipoProducto.create({
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion,
      productoBaseParaOferta: input.productoBaseParaOferta ?? false,
    },
  });

  return {
    id: tipo.id,
    nombre: tipo.nombre,
    descripcion: tipo.descripcion,
    productoBaseParaOferta: tipo.productoBaseParaOferta,
    createdAt: tipo.createdAt,
  };
}

export async function updateTipoProducto(id: string, input: TipoProductoInput) {
  const tipo = await prisma.tipoProducto.update({
    where: { id },
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion,
      productoBaseParaOferta: input.productoBaseParaOferta,
    },
  });

  return {
    id: tipo.id,
    nombre: tipo.nombre,
    descripcion: tipo.descripcion,
    productoBaseParaOferta: tipo.productoBaseParaOferta,
    createdAt: tipo.createdAt,
  };
}

export async function deleteTipoProducto(id: string): Promise<void> {
  await prisma.tipoProducto.delete({
    where: { id },
  });
}

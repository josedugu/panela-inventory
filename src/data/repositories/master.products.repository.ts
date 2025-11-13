import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export interface ProductDTO {
  id: string;
  costo?: number | null;
  pvp?: number | null;
  cantidad: number;
  descripcion?: string | null;
  estado: boolean;
  tipoProductoId?: string | null;
  tipoProductoNombre?: string | null;
  imagenUrl?: string | null;
  marcaId?: string | null;
  marcaNombre?: string | null;
  modeloId?: string | null;
  modeloNombre?: string | null;
  almacenamientoId?: string | null;
  almacenamientoCapacidad?: number | null;
  ramId?: string | null;
  ramCapacidad?: number | null;
  colorId?: string | null;
  colorNombre?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductInput {
  costo?: number | null;
  pvp?: number | null;
  descripcion?: string | null;
  tipoProductoId?: string | null;
  imagenUrl?: string | null;
  marcaId?: string | null;
  modeloId?: string | null;
  almacenamientoId?: string | null;
  ramId?: string | null;
  colorId?: string | null;
  estado?: boolean;
}

export async function listProducts(): Promise<ProductDTO[]> {
  const products = await prisma.producto.findMany({
    include: {
      tipoProducto: true,
      marca: true,
      modelo: true,
      almacenamiento: true,
      ram: true,
      color: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => ({
    id: product.id,
    costo: product.costo ? Number(product.costo) : null,
    pvp: product.pvp ? Number(product.pvp) : null,
    cantidad: product.cantidad,
    descripcion: product.descripcion,
    estado: product.estado,
    tipoProductoId: product.tipoProductoId,
    tipoProductoNombre: product.tipoProducto?.nombre ?? null,
    imagenUrl: product.imagenUrl,
    marcaId: product.marcaId,
    marcaNombre: product.marca?.nombre ?? null,
    modeloId: product.modeloId,
    modeloNombre: product.modelo?.nombre ?? null,
    almacenamientoId: product.almacenamientoId,
    almacenamientoCapacidad: product.almacenamiento?.capacidad
      ? Number(product.almacenamiento.capacidad)
      : null,
    ramId: product.ramId,
    ramCapacidad: product.ram?.capacidad ? Number(product.ram.capacidad) : null,
    colorId: product.colorId,
    colorNombre: product.color?.nombre ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));
}

export async function createProduct(input: ProductInput): Promise<ProductDTO> {
  const product = await prisma.producto.create({
    data: {
      costo: input.costo ? new Prisma.Decimal(input.costo.toString()) : null,
      pvp: input.pvp ? new Prisma.Decimal(input.pvp.toString()) : null,
      descripcion: input.descripcion,
      tipoProductoId: input.tipoProductoId || undefined,
      imagenUrl: input.imagenUrl,
      marcaId: input.marcaId || undefined,
      modeloId: input.modeloId || undefined,
      almacenamientoId: input.almacenamientoId || undefined,
      ramId: input.ramId || undefined,
      colorId: input.colorId || undefined,
      estado: input.estado ?? true,
    },
    include: {
      tipoProducto: true,
      marca: true,
      modelo: true,
      almacenamiento: true,
      ram: true,
      color: true,
    },
  });

  return {
    id: product.id,
    costo: product.costo ? Number(product.costo) : null,
    pvp: product.pvp ? Number(product.pvp) : null,
    cantidad: product.cantidad,
    descripcion: product.descripcion,
    estado: product.estado,
    tipoProductoId: product.tipoProductoId,
    tipoProductoNombre: product.tipoProducto?.nombre ?? null,
    imagenUrl: product.imagenUrl,
    marcaId: product.marcaId,
    marcaNombre: product.marca?.nombre ?? null,
    modeloId: product.modeloId,
    modeloNombre: product.modelo?.nombre ?? null,
    almacenamientoId: product.almacenamientoId,
    almacenamientoCapacidad: product.almacenamiento?.capacidad
      ? Number(product.almacenamiento.capacidad)
      : null,
    ramId: product.ramId,
    ramCapacidad: product.ram?.capacidad ? Number(product.ram.capacidad) : null,
    colorId: product.colorId,
    colorNombre: product.color?.nombre ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ProductDTO> {
  const product = await prisma.producto.update({
    where: { id },
    data: {
      costo: input.costo ? new Prisma.Decimal(input.costo.toString()) : null,
      pvp: input.pvp ? new Prisma.Decimal(input.pvp.toString()) : null,
      descripcion: input.descripcion,
      tipoProductoId: input.tipoProductoId || undefined,
      imagenUrl: input.imagenUrl,
      marcaId: input.marcaId || undefined,
      modeloId: input.modeloId || undefined,
      almacenamientoId: input.almacenamientoId || undefined,
      ramId: input.ramId || undefined,
      colorId: input.colorId || undefined,
      estado: input.estado ?? true,
    },
    include: {
      tipoProducto: true,
      marca: true,
      modelo: true,
      almacenamiento: true,
      ram: true,
      color: true,
    },
  });

  return {
    id: product.id,
    costo: product.costo ? Number(product.costo) : null,
    pvp: product.pvp ? Number(product.pvp) : null,
    cantidad: product.cantidad,
    descripcion: product.descripcion,
    estado: product.estado,
    tipoProductoId: product.tipoProductoId,
    tipoProductoNombre: product.tipoProducto?.nombre ?? null,
    imagenUrl: product.imagenUrl,
    marcaId: product.marcaId,
    marcaNombre: product.marca?.nombre ?? null,
    modeloId: product.modeloId,
    modeloNombre: product.modelo?.nombre ?? null,
    almacenamientoId: product.almacenamientoId,
    almacenamientoCapacidad: product.almacenamiento?.capacidad
      ? Number(product.almacenamiento.capacidad)
      : null,
    ramId: product.ramId,
    ramCapacidad: product.ram?.capacidad ? Number(product.ram.capacidad) : null,
    colorId: product.colorId,
    colorNombre: product.color?.nombre ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.producto.delete({
    where: { id },
  });
}

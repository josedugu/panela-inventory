import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface SupplierDTO {
  id: string;
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SupplierInput {
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion?: string | null;
}

export async function listSuppliers(): Promise<SupplierDTO[]> {
  const suppliers = await prisma.proveedor.findMany({
    orderBy: { createdAt: "desc" },
  });

  return suppliers.map((supplier) => ({
    id: supplier.id,
    nombre: supplier.nombre,
    contacto: supplier.contacto,
    email: supplier.email,
    telefono: supplier.telefono,
    direccion: supplier.direccion,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  }));
}

export async function createSupplier(
  input: SupplierInput,
): Promise<SupplierDTO> {
  const supplier = await prisma.proveedor.create({
    data: {
      nombre: input.nombre,
      contacto: input.contacto,
      email: input.email,
      telefono: input.telefono,
      direccion: input.direccion,
    },
  });

  return {
    id: supplier.id,
    nombre: supplier.nombre,
    contacto: supplier.contacto,
    email: supplier.email,
    telefono: supplier.telefono,
    direccion: supplier.direccion,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}

export async function updateSupplier(
  id: string,
  input: SupplierInput,
): Promise<SupplierDTO> {
  const supplier = await prisma.proveedor.update({
    where: { id },
    data: {
      nombre: input.nombre,
      contacto: input.contacto,
      email: input.email,
      telefono: input.telefono,
      direccion: input.direccion,
    },
  });

  return {
    id: supplier.id,
    nombre: supplier.nombre,
    contacto: supplier.contacto,
    email: supplier.email,
    telefono: supplier.telefono,
    direccion: supplier.direccion,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}

export async function deleteSupplier(id: string): Promise<void> {
  await prisma.proveedor.delete({
    where: { id },
  });
}

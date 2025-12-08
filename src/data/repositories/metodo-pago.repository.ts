import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface MetodoPagoDTO {
  id: string;
  nombre: string;
  esCredito: boolean;
  createdAt: Date;
  updatedAt: Date;
  estado: boolean;
  comisionAsesor: number | null;
}

interface MetodoPagoInput {
  nombre: string;
  esCredito: boolean;
  comisionAsesor?: number | string | null;
}

function parseComisionAsesor(value: MetodoPagoInput["comisionAsesor"]) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function listMetodoPagos(): Promise<MetodoPagoDTO[]> {
  const metodoPagos = await prisma.metodoPago.findMany({
    orderBy: { createdAt: "desc" },
  });

  return metodoPagos.map((metodoPago) => ({
    id: metodoPago.id,
    nombre: metodoPago.nombre,
    esCredito: metodoPago.esCredito,
    createdAt: metodoPago.createdAt,
    updatedAt: metodoPago.updatedAt,
    estado: metodoPago.estado,
    comisionAsesor: metodoPago.comisionAsesor?.toNumber() ?? null,
  }));
}

export async function createMetodoPago(input: MetodoPagoInput) {
  const comisionAsesor = parseComisionAsesor(input.comisionAsesor);
  const metodoPago = await prisma.metodoPago.create({
    data: {
      nombre: input.nombre,
      esCredito: input.esCredito,
      comisionAsesor,
    },
  });

  return {
    id: metodoPago.id,
    nombre: metodoPago.nombre,
    esCredito: metodoPago.esCredito,
    createdAt: metodoPago.createdAt,
    updatedAt: metodoPago.updatedAt,
    estado: metodoPago.estado,
    comisionAsesor: metodoPago.comisionAsesor?.toNumber() ?? null,
  };
}

export async function updateMetodoPago(id: string, input: MetodoPagoInput) {
  const comisionAsesor = parseComisionAsesor(input.comisionAsesor);
  const metodoPago = await prisma.metodoPago.update({
    where: { id },
    data: {
      nombre: input.nombre,
      esCredito: input.esCredito,
      comisionAsesor,
    },
  });

  return {
    id: metodoPago.id,
    nombre: metodoPago.nombre,
    esCredito: metodoPago.esCredito,
    createdAt: metodoPago.createdAt,
    updatedAt: metodoPago.updatedAt,
    estado: metodoPago.estado,
    comisionAsesor: metodoPago.comisionAsesor?.toNumber() ?? null,
  };
}

export async function deleteMetodoPago(id: string) {
  await prisma.metodoPago.delete({
    where: { id },
  });
}

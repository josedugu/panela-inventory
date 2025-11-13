import "server-only";

import { prisma } from "@/lib/prisma/client";

export interface UserDTO {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  rolId?: string | null;
  rolNombre?: string | null;
  centroCostoId?: string | null;
  centroCostoNombre?: string | null;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDTO {
  id: string;
  nombre: string;
}

interface UserInput {
  nombre: string;
  email: string;
  telefono?: string | null;
  rolId: string;
  centroCostoId?: string | null;
  estado?: boolean;
}

export async function listRoles(): Promise<RoleDTO[]> {
  const roles = await prisma.rol.findMany({
    orderBy: { nombre: "asc" },
  });

  return roles.map((role) => ({
    id: role.id,
    nombre: role.nombre,
  }));
}

export async function listUsers(): Promise<UserDTO[]> {
  const users = await prisma.usuario.findMany({
    include: {
      centroCostos: true,
      rol: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => ({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    rolId: user.rolId,
    rolNombre: user.rol?.nombre ?? null,
    centroCostoId: user.centroCostoId,
    centroCostoNombre: user.centroCostos?.nombre ?? null,
    estado: user.estado,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

export async function createUser(input: UserInput): Promise<UserDTO> {
  const user = await prisma.usuario.create({
    data: {
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono,
      rolId: input.rolId,
      centroCostoId: input.centroCostoId ?? null,
      estado: input.estado ?? true,
    },
    include: {
      centroCostos: true,
      rol: true,
    },
  });

  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    rolId: user.rolId,
    rolNombre: user.rol?.nombre ?? null,
    centroCostoId: user.centroCostoId,
    centroCostoNombre: user.centroCostos?.nombre ?? null,
    estado: user.estado,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateUser(
  id: string,
  input: UserInput,
): Promise<UserDTO> {
  const user = await prisma.usuario.update({
    where: { id },
    data: {
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono,
      rolId: input.rolId,
      centroCostoId: input.centroCostoId ?? null,
      estado: input.estado ?? true,
    },
    include: {
      centroCostos: true,
      rol: true,
    },
  });

  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    rolId: user.rolId,
    rolNombre: user.rol?.nombre ?? null,
    centroCostoId: user.centroCostoId,
    centroCostoNombre: user.centroCostos?.nombre ?? null,
    estado: user.estado,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.usuario.delete({
    where: { id },
  });
}

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
  authUserId?: string | null;
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
  authUserId?: string | null;
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
    authUserId: user.authUserId,
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
      estado: input.estado ?? true,
      authUserId: input.authUserId ?? null,
      rol: {
        connect: {
          id: input.rolId,
        },
      },
      centroCostos: input.centroCostoId
        ? {
            connect: {
              id: input.centroCostoId,
            },
          }
        : undefined,
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
    authUserId: user.authUserId,
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
      estado: input.estado ?? true,
      authUserId: input.authUserId ?? undefined,
      rol: {
        connect: {
          id: input.rolId,
        },
      },
      centroCostos:
        input.centroCostoId !== undefined
          ? input.centroCostoId
            ? {
                connect: {
                  id: input.centroCostoId,
                },
              }
            : {
                disconnect: true,
              }
          : undefined,
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
    authUserId: user.authUserId,
    estado: user.estado,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUserById(id: string): Promise<UserDTO | null> {
  const user = await prisma.usuario.findUnique({
    where: { id },
    include: {
      centroCostos: true,
      rol: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    rolId: user.rolId,
    rolNombre: user.rol?.nombre ?? null,
    centroCostoId: user.centroCostoId,
    centroCostoNombre: user.centroCostos?.nombre ?? null,
    authUserId: user.authUserId,
    estado: user.estado,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function linkUserToAuthAccount(
  id: string,
  authUserId: string | null,
) {
  await prisma.usuario.update({
    where: { id },
    data: { authUserId },
  });
}

export async function getRoleById(id: string): Promise<RoleDTO | null> {
  const role = await prisma.rol.findUnique({
    where: { id },
  });

  if (!role) {
    return null;
  }

  return {
    id: role.id,
    nombre: role.nombre,
  };
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.usuario.delete({
    where: { id },
  });
}

export async function getUserByAuthId(
  authUserId: string,
): Promise<UserDTO | null> {
  const user = await prisma.usuario.findUnique({
    where: { authUserId },
    include: {
      centroCostos: true,
      rol: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    rolId: user.rolId,
    rolNombre: user.rol?.nombre ?? null,
    centroCostoId: user.centroCostoId,
    centroCostoNombre: user.centroCostos?.nombre ?? null,
    authUserId: user.authUserId,
    estado: user.estado,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

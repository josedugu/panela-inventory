import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export interface ProductDTO {
  id: string;
  nombre?: string | null;
  costo?: number | null;
  pvp?: number | null;
  precioOferta?: number | null;
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
  precioOferta?: number | null;
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

/**
 * Construye el nombre del producto basado en sus relaciones
 * Formato: marca modelo almacenamiento ram color
 * Prioriza las relaciones directas sobre los valores del modelo
 */
function buildProductName(producto: {
  marca: { nombre: string } | null;
  modelo: {
    nombre: string;
    almacenamiento: string | null;
    color: string | null;
  } | null;
  almacenamiento: { capacidad: number } | null;
  ram: { capacidad: number } | null;
  color: { nombre: string } | null;
  descripcion: string | null;
}): string {
  const parts: string[] = [];

  if (producto.marca) {
    parts.push(producto.marca.nombre);
  }

  if (producto.modelo) {
    parts.push(producto.modelo.nombre);
  }

  // Usar almacenamiento directo si existe, si no, usar el del modelo
  if (producto.almacenamiento) {
    parts.push(`${producto.almacenamiento.capacidad}GB`);
  } else if (producto.modelo?.almacenamiento) {
    parts.push(producto.modelo.almacenamiento);
  }

  // Usar RAM directa si existe
  if (producto.ram) {
    parts.push(`${producto.ram.capacidad}GB`);
  }

  // Usar color directo si existe, si no, usar el del modelo (pero no ambos)
  if (producto.color) {
    parts.push(producto.color.nombre);
  } else if (producto.modelo?.color) {
    parts.push(producto.modelo.color);
  }

  if (producto.descripcion) {
    parts.push(producto.descripcion);
  }

  return parts.filter(Boolean).join(" ") || "Producto sin nombre";
}

export interface ProductFilters {
  nombre?: string;
  marca?: string;
  modelo?: string;
  estado?: string; // "activo" | "inactivo"
}

export interface ListProductsOptions {
  filters?: ProductFilters;
  page?: number;
  pageSize?: number;
}

export interface ListProductsResult {
  products: ProductDTO[];
  total: number;
}

export async function listProducts(
  options?: ListProductsOptions,
): Promise<ListProductsResult> {
  const filters = options?.filters;
  const page = options?.page ?? 1;
  // Si no se especifica pageSize, traer todos los registros (para compatibilidad)
  const pageSize = options?.pageSize;
  const skip = pageSize ? (page - 1) * pageSize : undefined;
  const whereClause: Prisma.ProductoWhereInput = {};

  // Filtro por nombre
  if (filters?.nombre) {
    whereClause.nombre = {
      contains: filters.nombre,
      mode: "insensitive",
    };
  }

  // Filtro por marca
  if (filters?.marca) {
    whereClause.marca = {
      nombre: {
        equals: filters.marca,
        mode: "insensitive",
      },
    };
  }

  // Filtro por modelo
  if (filters?.modelo) {
    whereClause.modelo = {
      nombre: {
        equals: filters.modelo,
        mode: "insensitive",
      },
    };
  }

  // Filtro por estado
  if (filters?.estado) {
    const estadoValue = filters.estado.toLowerCase();
    if (estadoValue === "activo") {
      whereClause.estado = true;
    } else if (estadoValue === "inactivo") {
      whereClause.estado = false;
    }
  }

  // Obtener el total de registros que coinciden con los filtros
  const total = await prisma.producto.count({
    where: whereClause,
  });

  // Obtener los productos paginados (o todos si no se especifica pageSize)
  const products = await prisma.producto.findMany({
    where: whereClause,
    include: {
      tipoProducto: true,
      marca: true,
      modelo: true,
      almacenamiento: true,
      ram: true,
      color: true,
    },
    orderBy: { nombre: "asc" },
    ...(pageSize && { take: pageSize, skip }),
  });

  const productDTOs = products.map((product) => ({
    id: product.id,
    nombre: product.nombre,
    costo: product.costo ? Number(product.costo) : null,
    pvp: product.pvp ? Number(product.pvp) : null,
    precioOferta: product.precioOferta ? Number(product.precioOferta) : null,
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

  return {
    products: productDTOs,
    total,
  };
}

export async function createProduct(input: ProductInput): Promise<ProductDTO> {
  return await prisma.$transaction(async (tx) => {
    // 1. Crear el producto (sin nombre aún)
    const product = await tx.producto.create({
      data: {
        costo: input.costo ? new Prisma.Decimal(input.costo.toString()) : null,
        pvp: input.pvp ? new Prisma.Decimal(input.pvp.toString()) : null,
        precioOferta:
          input.precioOferta != null
            ? new Prisma.Decimal(input.precioOferta.toString())
            : null,
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

    // 2. Construir el nombre basado en las relaciones
    const nombre = buildProductName({
      marca: product.marca,
      modelo: product.modelo,
      almacenamiento: product.almacenamiento,
      ram: product.ram,
      color: product.color,
      descripcion: product.descripcion,
    });

    // 3. Actualizar el producto con el nombre construido
    const updatedProduct = await tx.producto.update({
      where: { id: product.id },
      data: { nombre },
      include: {
        tipoProducto: true,
        marca: true,
        modelo: true,
        almacenamiento: true,
        ram: true,
        color: true,
      },
    });

    // 4. Retornar el DTO con el nombre incluido
    return {
      id: updatedProduct.id,
      nombre: updatedProduct.nombre,
      costo: updatedProduct.costo ? Number(updatedProduct.costo) : null,
      pvp: updatedProduct.pvp ? Number(updatedProduct.pvp) : null,
      precioOferta: updatedProduct.precioOferta
        ? Number(updatedProduct.precioOferta)
        : null,
      cantidad: updatedProduct.cantidad,
      descripcion: updatedProduct.descripcion,
      estado: updatedProduct.estado,
      tipoProductoId: updatedProduct.tipoProductoId,
      tipoProductoNombre: updatedProduct.tipoProducto?.nombre ?? null,
      imagenUrl: updatedProduct.imagenUrl,
      marcaId: updatedProduct.marcaId,
      marcaNombre: updatedProduct.marca?.nombre ?? null,
      modeloId: updatedProduct.modeloId,
      modeloNombre: updatedProduct.modelo?.nombre ?? null,
      almacenamientoId: updatedProduct.almacenamientoId,
      almacenamientoCapacidad: updatedProduct.almacenamiento?.capacidad
        ? Number(updatedProduct.almacenamiento.capacidad)
        : null,
      ramId: updatedProduct.ramId,
      ramCapacidad: updatedProduct.ram?.capacidad
        ? Number(updatedProduct.ram.capacidad)
        : null,
      colorId: updatedProduct.colorId,
      colorNombre: updatedProduct.color?.nombre ?? null,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
    };
  });
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ProductDTO> {
  return await prisma.$transaction(async (tx) => {
    // 1. Actualizar el producto
    const product = await tx.producto.update({
      where: { id },
      data: {
        costo: input.costo ? new Prisma.Decimal(input.costo.toString()) : null,
        pvp: input.pvp ? new Prisma.Decimal(input.pvp.toString()) : null,
        precioOferta:
          input.precioOferta != null
            ? new Prisma.Decimal(input.precioOferta.toString())
            : null,
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

    // 2. Construir el nombre basado en las relaciones actualizadas
    const nombre = buildProductName({
      marca: product.marca,
      modelo: product.modelo,
      almacenamiento: product.almacenamiento,
      ram: product.ram,
      color: product.color,
      descripcion: product.descripcion,
    });

    // 3. Actualizar el nombre del producto
    const updatedProduct = await tx.producto.update({
      where: { id: product.id },
      data: { nombre },
      include: {
        tipoProducto: true,
        marca: true,
        modelo: true,
        almacenamiento: true,
        ram: true,
        color: true,
      },
    });

    // 4. Retornar el DTO con el nombre actualizado
    return {
      id: updatedProduct.id,
      nombre: updatedProduct.nombre,
      costo: updatedProduct.costo ? Number(updatedProduct.costo) : null,
      pvp: updatedProduct.pvp ? Number(updatedProduct.pvp) : null,
      precioOferta: updatedProduct.precioOferta
        ? Number(updatedProduct.precioOferta)
        : null,
      cantidad: updatedProduct.cantidad,
      descripcion: updatedProduct.descripcion,
      estado: updatedProduct.estado,
      tipoProductoId: updatedProduct.tipoProductoId,
      tipoProductoNombre: updatedProduct.tipoProducto?.nombre ?? null,
      imagenUrl: updatedProduct.imagenUrl,
      marcaId: updatedProduct.marcaId,
      marcaNombre: updatedProduct.marca?.nombre ?? null,
      modeloId: updatedProduct.modeloId,
      modeloNombre: updatedProduct.modelo?.nombre ?? null,
      almacenamientoId: updatedProduct.almacenamientoId,
      almacenamientoCapacidad: updatedProduct.almacenamiento?.capacidad
        ? Number(updatedProduct.almacenamiento.capacidad)
        : null,
      ramId: updatedProduct.ramId,
      ramCapacidad: updatedProduct.ram?.capacidad
        ? Number(updatedProduct.ram.capacidad)
        : null,
      colorId: updatedProduct.colorId,
      colorNombre: updatedProduct.color?.nombre ?? null,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
    };
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.producto.delete({
    where: { id },
  });
}

export interface ProductFilterOptions {
  marcas: string[];
  modelos: string[];
}

export async function getProductFilterOptions(): Promise<ProductFilterOptions> {
  // Obtener marcas únicas de productos
  const marcas = await prisma.producto.findMany({
    where: {
      marca: {
        isNot: null,
      },
    },
    select: {
      marca: {
        select: {
          nombre: true,
        },
      },
    },
    distinct: ["marcaId"],
  });

  // Obtener modelos únicos de productos
  const modelos = await prisma.producto.findMany({
    where: {
      modelo: {
        isNot: null,
      },
    },
    select: {
      modelo: {
        select: {
          nombre: true,
        },
      },
    },
    distinct: ["modeloId"],
  });

  return {
    marcas: marcas
      .map((p) => p.marca?.nombre)
      .filter((n): n is string => Boolean(n))
      .sort(),
    modelos: modelos
      .map((p) => p.modelo?.nombre)
      .filter((n): n is string => Boolean(n))
      .sort(),
  };
}

/**
 * Crea múltiples productos en una transacción
 * Genera todas las combinaciones posibles de los arrays proporcionados
 */
export async function createMultipleProducts(
  inputs: ProductInput[],
): Promise<ProductDTO[]> {
  // Aumentar timeout a 30 segundos para transacciones con muchos productos
  return await prisma.$transaction(
    async (tx) => {
      // Primero, obtener todas las relaciones necesarias de una vez
      const marcaIds = new Set(
        inputs
          .map((input) => input.marcaId)
          .filter((id): id is string => Boolean(id)),
      );
      const modeloIds = new Set(
        inputs
          .map((input) => input.modeloId)
          .filter((id): id is string => Boolean(id)),
      );
      const almacenamientoIds = new Set(
        inputs
          .map((input) => input.almacenamientoId)
          .filter((id): id is string => Boolean(id)),
      );
      const ramIds = new Set(
        inputs
          .map((input) => input.ramId)
          .filter((id): id is string => Boolean(id)),
      );
      const colorIds = new Set(
        inputs
          .map((input) => input.colorId)
          .filter((id): id is string => Boolean(id)),
      );

      // Obtener todas las relaciones en paralelo
      const [marcas, modelos, almacenamientos, _rams, colores] =
        await Promise.all([
          marcaIds.size > 0
            ? tx.marca.findMany({
                where: { id: { in: Array.from(marcaIds) } },
              })
            : [],
          modeloIds.size > 0
            ? tx.modelo.findMany({
                where: { id: { in: Array.from(modeloIds) } },
              })
            : [],
          almacenamientoIds.size > 0
            ? tx.almacenamiento.findMany({
                where: { id: { in: Array.from(almacenamientoIds) } },
              })
            : [],
          ramIds.size > 0
            ? tx.ram.findMany({
                where: { id: { in: Array.from(ramIds) } },
              })
            : [],
          colorIds.size > 0
            ? tx.color.findMany({
                where: { id: { in: Array.from(colorIds) } },
              })
            : [],
        ]);

      // Crear un mapa para acceso rápido
      const marcaMap = new Map(marcas.map((m) => [m.id, m]));
      const modeloMap = new Map(modelos.map((m) => [m.id, m]));
      const almacenamientoMap = new Map(almacenamientos.map((a) => [a.id, a]));
      const ramMap = new Map(_rams.map((r) => [r.id, r]));
      const colorMap = new Map(colores.map((c) => [c.id, c]));

      const productIds: string[] = [];

      // Crear todos los productos primero (sin nombre)
      for (const input of inputs) {
        const product = await tx.producto.create({
          data: {
            costo: input.costo
              ? new Prisma.Decimal(input.costo.toString())
              : null,
            pvp: input.pvp ? new Prisma.Decimal(input.pvp.toString()) : null,
            precioOferta:
              input.precioOferta != null
                ? new Prisma.Decimal(input.precioOferta.toString())
                : null,
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
        });
        productIds.push(product.id);
      }

      // Construir nombres y actualizar todos los productos
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const productId = productIds[i];
        if (!input || !productId) continue;

        // Construir el nombre usando los mapas
        const modelo = input.modeloId
          ? (modeloMap.get(input.modeloId) ?? null)
          : null;
        const nombre = buildProductName({
          marca: input.marcaId ? (marcaMap.get(input.marcaId) ?? null) : null,
          modelo: modelo
            ? {
                nombre: modelo.nombre,
                almacenamiento: modelo.almacenamiento,
                color: modelo.color,
              }
            : null,
          almacenamiento: input.almacenamientoId
            ? (almacenamientoMap.get(input.almacenamientoId) ?? null)
            : null,
          ram: input.ramId ? (ramMap.get(input.ramId) ?? null) : null,
          color: input.colorId ? (colorMap.get(input.colorId) ?? null) : null,
          descripcion: input.descripcion ?? null,
        });

        // Actualizar con el nombre
        await tx.producto.update({
          where: { id: productId },
          data: { nombre },
        });
      }

      // Obtener todos los productos creados con sus relaciones
      const products = await tx.producto.findMany({
        where: { id: { in: productIds } },
        include: {
          tipoProducto: true,
          marca: true,
          modelo: true,
          almacenamiento: true,
          ram: true,
          color: true,
        },
      });

      // Convertir a DTOs
      return products.map((product) => ({
        id: product.id,
        nombre: product.nombre,
        costo: product.costo ? Number(product.costo) : null,
        pvp: product.pvp ? Number(product.pvp) : null,
        precioOferta: product.precioOferta
          ? Number(product.precioOferta)
          : null,
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
        ramCapacidad: product.ram?.capacidad
          ? Number(product.ram.capacidad)
          : null,
        colorId: product.colorId,
        colorNombre: product.color?.nombre ?? null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
    },
    {
      maxWait: 10000, // 10 segundos para iniciar la transacción
      timeout: 30000, // 30 segundos para completar la transacción
    },
  );
}

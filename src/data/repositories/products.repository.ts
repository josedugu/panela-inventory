import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export type ProductWithRelations = Prisma.ProductoGetPayload<{
  include: {
    tipoProducto: true;
    movimientoInventario: true;
    marca: true;
    modelo: true;
    proveedor: true;
    bodega: true;
  };
}>;

export async function getAllProducts(): Promise<ProductWithRelations[]> {
  return prisma.producto.findMany({
    include: {
      tipoProducto: true,
      movimientoInventario: true,
      marca: true,
      modelo: true,
      proveedor: true,
      bodega: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(
  id: string,
): Promise<ProductWithRelations | null> {
  return prisma.producto.findUnique({
    where: { id },
    include: {
      tipoProducto: true,
      movimientoInventario: true,
      marca: true,
      modelo: true,
      proveedor: true,
      bodega: true,
    },
  });
}

export async function searchProducts(
  query: string,
): Promise<ProductWithRelations[]> {
  return prisma.producto.findMany({
    where: {
      OR: [
        { imei: { contains: query, mode: "insensitive" } },
        { descripcion: { contains: query, mode: "insensitive" } },
        {
          marca: {
            nombre: { contains: query, mode: "insensitive" },
          },
        },
        {
          modelo: {
            nombre: { contains: query, mode: "insensitive" },
          },
        },
        {
          tipoProducto: {
            nombre: { contains: query, mode: "insensitive" },
          },
        },
      ],
    },
    include: {
      tipoProducto: true,
      movimientoInventario: true,
      marca: true,
      modelo: true,
      proveedor: true,
      bodega: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getLowStockProducts(
  threshold: number = 20,
): Promise<ProductWithRelations[]> {
  return prisma.producto.findMany({
    where: {
      movimientoInventario: {
        some: {
          cantidad: {
            lte: threshold,
          },
          estado: true,
        },
      },
    },
    include: {
      tipoProducto: true,
      movimientoInventario: true,
      marca: true,
      modelo: true,
      proveedor: true,
      bodega: true,
    },
  });
}

type CreateProductInput = Pick<
  Prisma.ProductoUncheckedCreateInput,
  | "estado"
  | "imei"
  | "descripcion"
  | "precio"
  | "costo"
  | "tipoProductoId"
  | "imagenUrl"
  | "marcaId"
  | "modeloId"
  | "bodegaId"
  | "proveedorId"
>;

export async function createProduct(productData: CreateProductInput) {
  const { precio, costo, ...rest } = productData;

  return prisma.producto.create({
    data: {
      ...rest,
      precio: new Prisma.Decimal(precio.toString()),
      costo: new Prisma.Decimal(costo.toString()),
    },
  });
}

type UpdateProductInput = Partial<
  Pick<
    Prisma.ProductoUncheckedUpdateInput,
    "imei" | "descripcion" | "precio" | "costo" | "tipoProductoId" | "imagenUrl"
  >
>;

export async function updateProduct(id: string, updates: UpdateProductInput) {
  const { precio, costo, ...rest } = updates;

  return prisma.producto.update({
    where: { id },
    data: {
      ...rest,
      ...(precio !== undefined
        ? { precio: new Prisma.Decimal(precio.toString()) }
        : {}),
      ...(costo !== undefined
        ? { costo: new Prisma.Decimal(costo.toString()) }
        : {}),
    },
  });
}

export async function deleteProduct(id: string) {
  await prisma.movimientoInventario.deleteMany({ where: { productoId: id } });
  await prisma.producto.delete({ where: { id } });
}

export async function updateInventory(productId: string, quantity: number) {
  return prisma.movimientoInventario.upsert({
    where: {
      productoId: productId,
    },
    update: {
      cantidad: quantity,
    },
    create: {
      productoId: productId,
      cantidad: quantity,
    },
  });
}

export interface InventoryFilterOptions {
  categories: string[];
  brands: string[];
  suppliers: string[];
  statuses: Array<"in-stock" | "low-stock" | "out-of-stock">;
}

export async function getInventoryFilterOptions(): Promise<InventoryFilterOptions> {
  const products = await prisma.producto.findMany({
    select: {
      tipoProducto: {
        select: {
          nombre: true,
        },
      },
      marca: {
        select: {
          nombre: true,
        },
      },
      proveedor: {
        select: {
          nombre: true,
        },
      },
    },
  });

  const categories = new Set<string>();
  const brands = new Set<string>();
  const suppliers = new Set<string>();

  for (const product of products) {
    if (product.tipoProducto?.nombre) {
      categories.add(product.tipoProducto.nombre);
    }
    if (product.marca?.nombre) {
      brands.add(product.marca.nombre);
    }
    if (product.proveedor?.nombre) {
      suppliers.add(product.proveedor.nombre);
    }
  }

  const toSortedArray = (values: Set<string>) =>
    Array.from(values)
      .filter((value) => value.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));

  return {
    categories: toSortedArray(categories),
    brands: toSortedArray(brands),
    suppliers: toSortedArray(suppliers),
    statuses: ["in-stock", "low-stock", "out-of-stock"],
  };
}

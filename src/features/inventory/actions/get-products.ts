"use server";

import type { ProductWithRelations } from "@/data/repositories/products.repository";
import { getAllProducts } from "@/data/repositories/products.repository";

export type InventoryProductDTO = {
  id: string;
  name: string;
  brand: string;
  model: string;
  sku: string;
  category: string;
  storage?: string;
  color?: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  supplier: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
};

function normalizeProduct(product: ProductWithRelations): InventoryProductDTO {
  const inventoryRecord = Array.isArray(product.movimientoInventario)
    ? product.movimientoInventario[0]
    : (product.movimientoInventario ?? null);

  const quantity = inventoryRecord?.cantidad ?? product.cantidad ?? 0;
  const minStock = 10;
  const isActive = product.estado ?? true;
  const isInventoryActive = inventoryRecord?.estado ?? true;

  const status: InventoryProductDTO["status"] =
    !isActive || !isInventoryActive || quantity === 0
      ? "out-of-stock"
      : quantity <= minStock
        ? "low-stock"
        : "in-stock";

  return {
    id: product.id,
    name:
      product.descripcion ??
      product.modelo?.nombre ??
      product.tipoProducto?.nombre ??
      "Producto sin descripción",
    brand: product.marca?.nombre ?? "Sin marca",
    model: product.modelo?.nombre ?? "-",
    sku: product.imei ?? "-",
    category: product.tipoProducto?.nombre ?? "Sin categoría",
    storage: product.modelo?.almacenamiento ?? undefined,
    color: product.modelo?.color ?? undefined,
    price: Number(product.precio ?? 0),
    cost: Number(product.costo ?? 0),
    quantity,
    minStock,
    supplier: product.proveedor?.nombre ?? "Sin proveedor",
    status,
    lastUpdated: product.updatedAt.toISOString(),
  };
}

interface GetProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  filters?: {
    category?: string;
    brand?: string;
    supplier?: string;
    status?: string;
  };
}

export interface GetProductsSuccess {
  success: true;
  data: InventoryProductDTO[];
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
}

interface GetProductsError {
  success: false;
  error: string;
}

export type GetProductsResult = GetProductsSuccess | GetProductsError;

export async function getProductsAction(
  params?: GetProductsParams,
): Promise<GetProductsResult> {
  try {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const products = await getAllProducts();
    const normalized = products.map(normalizeProduct);
    const availableCategories = Array.from(
      new Set(
        normalized
          .map((product) => product.category)
          .filter((category) => Boolean(category)),
      ),
    );

    let filtered = normalized;

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.brand.toLowerCase().includes(searchLower) ||
          p.model.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower),
      );
    }

    const filters = params?.filters ?? {};

    const filterCategory = filters.category ?? params?.category;
    if (filterCategory && filterCategory !== "all") {
      const categoryLower = filterCategory.toLowerCase();
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === categoryLower,
      );
    }

    if (filters.brand) {
      const brandLower = filters.brand.toLowerCase();
      filtered = filtered.filter((p) => p.brand.toLowerCase() === brandLower);
    }

    if (filters.supplier) {
      const supplierLower = filters.supplier.toLowerCase();
      filtered = filtered.filter(
        (p) => p.supplier.toLowerCase() === supplierLower,
      );
    }

    if (filters.status) {
      const statusLower = filters.status.toLowerCase();
      filtered = filtered.filter((p) => p.status.toLowerCase() === statusLower);
    }

    const total = filtered.length;
    const paginatedProducts = filtered.slice(offset, offset + pageSize);

    return {
      success: true,
      data: paginatedProducts,
      total,
      page,
      pageSize,
      categories: availableCategories,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Failed to fetch products",
    };
  }
}

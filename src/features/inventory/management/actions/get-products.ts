"use server";

import type {
  AggregatedProductData,
  InventoryFilters,
} from "@/data/repositories/products.repository";
import {
  getAllProductDetails,
  getAllProductDetailsCount,
  getFilteredProductDetails,
  getFilteredProductDetailsCount,
} from "@/data/repositories/products.repository";

export type InventoryProductDTO = {
  id: string; // ID del producto (Producto.id) para acciones (delete/update)
  name: string; // Nombre formateado con marca, modelo, almacenamiento y color
  quantity: number;
  pvp: number;
  cost: number;
  category: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
};

function normalizeProduct(data: AggregatedProductData): InventoryProductDTO {
  const minStock = 10;
  const quantity = data.cantidad;

  const status: InventoryProductDTO["status"] =
    quantity <= 0
      ? "out-of-stock"
      : quantity <= minStock
        ? "low-stock"
        : "in-stock";

  return {
    id: data.id,
    name: data.nombre || "Producto sin nombre",
    quantity,
    pvp: data.pvp,
    cost: data.costo,
    category: data.categoria,
    status,
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
    model?: string;
    storage?: string;
    color?: string;
    imei?: string;
    supplier?: string;
    status?: string;
    cost?: string;
    quantity?: string;
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

    const filters = params?.filters ?? {};
    const hasFilters = Object.keys(filters).length > 0 || params?.category;

    // Si hay filtros, usar la función con filtros
    // Si no hay filtros, usar la función SQL original para mejor rendimiento
    let productData: AggregatedProductData[];
    let total: number;

    if (hasFilters) {
      // Construir objeto de filtros para el repository
      const inventoryFilters: InventoryFilters = {
        category: filters.category ?? params?.category,
        brand: filters.brand,
        model: filters.model,
        storage: filters.storage,
        color: filters.color,
        imei: filters.imei,
        supplier: filters.supplier,
        status: filters.status,
        cost: filters.cost,
        quantity: filters.quantity,
      };

      // Remover filtros undefined
      Object.keys(inventoryFilters).forEach((key) => {
        const filterKey = key as keyof InventoryFilters;
        if (inventoryFilters[filterKey] === undefined) {
          delete inventoryFilters[filterKey];
        }
      });

      // Obtener productos con filtros aplicados
      productData = await getFilteredProductDetails(
        inventoryFilters,
        pageSize,
        offset,
      );

      // Obtener total con filtros aplicados
      total = await getFilteredProductDetailsCount(inventoryFilters);
    } else {
      // Sin filtros, usar función SQL original
      productData = await getAllProductDetails(pageSize, offset);
      total = await getAllProductDetailsCount();
    }

    const normalized = productData.map(normalizeProduct);

    // Aplicar búsqueda local si existe (solo para nombres y categorías)
    let filtered = normalized;
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower),
      );
      // Si hay búsqueda, ajustar el total
      if (hasFilters) {
        // El total ya está ajustado por filtros, pero la búsqueda es local
        // Por simplicidad, usamos el length del resultado filtrado
        total = filtered.length;
      }
    }

    const availableCategories = Array.from(
      new Set(
        filtered
          .map((product) => product.category)
          .filter((category) => Boolean(category)),
      ),
    );

    return {
      success: true,
      data: filtered,
      total,
      page,
      pageSize,
      categories: availableCategories,
    };
  } catch {
    return {
      success: false,
      error: "Failed to fetch products",
    };
  }
}

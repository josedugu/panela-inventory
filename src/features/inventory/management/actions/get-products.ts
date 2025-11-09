"use server";

import type { AggregatedProductData } from "@/data/repositories/products.repository";
import {
  getAllProductDetails,
  getAllProductDetailsCount,
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

type NumericOperator = ">=" | "<=" | "=";

function parseNumericFilterValue(
  rawValue: string | undefined,
): { operator: NumericOperator; value: number } | null {
  if (!rawValue) {
    return null;
  }

  const match = rawValue.match(/^(>=|<=|=)\s*(\d+(?:\.\d*)?)$/);
  if (!match) {
    return null;
  }

  const numericValue = Number(match[2]);
  if (Number.isNaN(numericValue)) {
    return null;
  }

  return {
    operator: match[1] as NumericOperator,
    value: numericValue,
  };
}

function applyNumericFilter(
  data: InventoryProductDTO[],
  filterValue: string | undefined,
  selector: (product: InventoryProductDTO) => number,
): InventoryProductDTO[] {
  const parsed = parseNumericFilterValue(filterValue);

  if (!parsed) {
    return data;
  }

  return data.filter((product) => {
    const candidate = selector(product);
    if (!Number.isFinite(candidate)) return false;

    switch (parsed.operator) {
      case ">=":
        return candidate >= parsed.value;
      case "<=":
        return candidate <= parsed.value;
      case "=":
        return candidate === parsed.value;
      default:
        return true;
    }
  });
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

    // Siempre usar paginación SQL para evitar cargar todos los registros
    const productData = await getAllProductDetails(pageSize, offset);

    const normalized = productData.map(normalizeProduct);
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

    if (filters.status) {
      const statusLower = filters.status.toLowerCase();
      filtered = filtered.filter((p) => p.status.toLowerCase() === statusLower);
    }

    filtered = applyNumericFilter(filtered, filters.cost, (p) => p.cost);
    filtered = applyNumericFilter(
      filtered,
      filters.quantity,
      (p) => p.quantity,
    );

    // Los productos ya vienen ordenados alfabéticamente por marca desde SQL
    // Obtener el total desde la función SQL
    const total = await getAllProductDetailsCount();

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

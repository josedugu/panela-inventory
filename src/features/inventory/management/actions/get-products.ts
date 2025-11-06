"use server";

import type { ProductDetailWithRelations } from "@/data/repositories/products.repository";
import {
  getAllProductDetails,
  getAllProductDetailsCount,
} from "@/data/repositories/products.repository";

export type InventoryProductDTO = {
  id: string; // ID del detalle (ProductoDetalle.id) para unicidad en el datagrid
  productId: string; // ID del producto (Producto.id) para acciones (delete/update)
  brand: string;
  model: string;
  category: string;
  storage?: string;
  color?: string;
  cost: number;
  quantity: number;
  imei: string;
  supplier: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
  createdAt: string;
  name?: string;
  latestMovement?: {
    id: string;
    typeId?: string;
    quantity: number;
    cost: number;
    imeis: string[];
  };
};

function normalizeProduct(
  detail: ProductDetailWithRelations,
): InventoryProductDTO {
  const product = detail.producto;
  const movements = detail.movimientoInventario ?? [];

  // Obtener el movimiento más reciente para este detalle
  const latestMovement = movements
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime(),
    )[0];

  const latestMovementImeis = latestMovement
    ? [detail.imei].filter((imei): imei is string =>
        Boolean(imei?.trim().length),
      )
    : [];

  // Para cada detalle, la cantidad es 1 (cada registro es un detalle)
  const quantity = 1;
  const minStock = 10;
  const isActive = detail.estado && product.estado;

  const status: InventoryProductDTO["status"] =
    !isActive || quantity <= 0
      ? "out-of-stock"
      : quantity <= minStock
        ? "low-stock"
        : "in-stock";

  const baseName =
    product.descripcion ??
    detail.nombre ??
    product.modelo?.nombre ??
    product.tipoProducto?.nombre ??
    "Producto sin descripción";
  const baseSku = detail.imei ?? "-";
  const latestMovementCost = latestMovement?.costoUnitario
    ? Number(latestMovement.costoUnitario)
    : undefined;
  const movementCost = latestMovementCost;
  const productCost = product.costo ? Number(product.costo) : undefined;
  const computedCost = movementCost ?? productCost ?? 0;

  // Obtener almacenamiento desde producto.modelo (para consistencia con filtros) o producto.almacenamiento
  const storage =
    product.modelo?.almacenamiento ??
    (product.almacenamiento?.capacidad
      ? `${product.almacenamiento.capacidad}GB`
      : undefined);

  // Obtener color desde producto.color o producto.modelo
  const color = product.color?.nombre ?? product.modelo?.color ?? undefined;

  return {
    id: detail.id, // ID del detalle para unicidad en el datagrid
    productId: product.id, // ID del producto para acciones (delete/update)
    brand: product.marca?.nombre ?? "Sin marca",
    model: product.modelo?.nombre ?? "-",
    imei: baseSku,
    category: product.tipoProducto?.nombre ?? "Sin categoría",
    storage,
    color,
    cost: computedCost,
    quantity,
    supplier: product.proveedor?.nombre ?? "Sin proveedor",
    status,
    lastUpdated: detail.updatedAt.toISOString(),
    createdAt: detail.createdAt.toISOString(),
    name: baseName,
    latestMovement: latestMovement
      ? {
          id: latestMovement.id,
          typeId: latestMovement.tipoMovimientoId ?? undefined,
          quantity: latestMovement.cantidad,
          cost: latestMovementCost ?? computedCost,
          imeis: Array.from(new Set(latestMovementImeis)),
        }
      : undefined,
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
    const productDetails = await getAllProductDetails(pageSize, offset);

    const normalized = productDetails.map(normalizeProduct);
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
          (p.name ?? "").toLowerCase().includes(searchLower) ||
          p.imei.toLowerCase().includes(searchLower) ||
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

    if (filters.model) {
      const modelLower = filters.model.toLowerCase();
      filtered = filtered.filter(
        (p) => (p.model ?? "-").toLowerCase() === modelLower,
      );
    }

    if (filters.storage) {
      const storageLower = filters.storage.toLowerCase();
      filtered = filtered.filter(
        (p) => (p.storage ?? "").toLowerCase() === storageLower,
      );
    }

    if (filters.color) {
      const colorLower = filters.color.toLowerCase();
      filtered = filtered.filter(
        (p) => (p.color ?? "").toLowerCase() === colorLower,
      );
    }

    if (filters.imei) {
      const imeiLower = filters.imei.toLowerCase();
      filtered = filtered.filter((p) =>
        p.imei.toLowerCase().includes(imeiLower),
      );
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

    filtered = applyNumericFilter(filtered, filters.cost, (p) => p.cost);
    filtered = applyNumericFilter(
      filtered,
      filters.quantity,
      (p) => p.quantity,
    );

    const sortedByCreationDate = filtered
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    // Obtener el total desde la función SQL (siempre)
    // Nota: Si hay filtros aplicados, el total puede no ser exacto ya que
    // los filtros se aplican después de la paginación SQL
    const total = await getAllProductDetailsCount();

    // Los productos ya vienen paginados de SQL
    // Los filtros se aplican sobre los datos paginados
    return {
      success: true,
      data: sortedByCreationDate,
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

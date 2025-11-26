"use server";

import { z } from "zod";

import {
  createMultipleProducts,
  createProduct,
  deleteProduct,
  getProductFilterOptions,
  listProducts,
  type ProductDTO,
  type ProductFilters,
  updateProduct,
} from "@/data/repositories/master.products.repository";
import { isPrismaKnownError } from "@/data/repositories/shared.repository";

type ActionResponse =
  | { success: true }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

function validationError(
  errors: Record<string, string[] | undefined>,
): ActionResponse {
  return {
    success: false,
    error: "Revisa los datos ingresados",
    fieldErrors: errors,
  };
}

function prismaError(error: unknown): ActionResponse {
  if (isPrismaKnownError(error)) {
    if (error.code === "P2002") {
      return {
        success: false,
        error: "Ya existe un registro con los datos proporcionados",
      };
    }
    if (error.code === "P2003") {
      return {
        success: false,
        error:
          "No se puede eliminar el registro porque está asociado a otros datos",
      };
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: "Ocurrió un error inesperado",
  };
}

const productSchema = z.object({
  tipoProductoId: z.string().uuid("Selecciona un tipo de producto válido"),
  marcaId: z.string().uuid("Selecciona una marca válida"),
  modeloId: z.string().uuid("Selecciona un modelo válido").optional(),
  almacenamientoIds: z.array(z.string().uuid()).optional(), // Array para multiselect
  ramIds: z.array(z.string().uuid()).optional(), // Array para multiselect
  colorIds: z.array(z.string().uuid()).optional(), // Array para multiselect
  pvp: z
    .union([
      z.string().min(1, "El PVP es obligatorio"),
      z.number().positive("El PVP debe ser un número positivo"),
    ])
    .transform((val) => {
      if (typeof val === "number") return val;
      if (!val || val === "") return undefined;
      const num = Number.parseFloat(val);
      return Number.isNaN(num) ? undefined : num;
    }),
  descripcion: z.string().optional(),
  estado: z.boolean().optional(),
});

export async function upsertProductAction(
  values: z.infer<typeof productSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const { almacenamientoIds, ramIds, colorIds, ...restData } = parsed.data;
  const productData = {
    ...restData,
    almacenamientoId: almacenamientoIds?.[0],
    ramId: ramIds?.[0],
    colorId: colorIds?.[0],
  };

  try {
    if (values.id) {
      await updateProduct(values.id, productData);
    } else {
      await createProduct(productData);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

/**
 * Genera múltiples productos a partir de combinaciones cartesianas.
 * Usar solo para flujos de creación masiva (no en upsert individual).
 */
export async function createProductsBatchAction(
  values: z.infer<typeof productSchema>,
): Promise<ActionResponse> {
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const { almacenamientoIds, ramIds, colorIds, ...restData } = parsed.data;

  // Normalizar arrays: si no hay valores, usar undefined para conservar combinaciones
  const arraysToCombine: (string | undefined)[][] = [
    almacenamientoIds && almacenamientoIds.length > 0
      ? almacenamientoIds
      : [undefined],
    ramIds && ramIds.length > 0 ? ramIds : [undefined],
    colorIds && colorIds.length > 0 ? colorIds : [undefined],
  ];

  const combinations = cartesian(...arraysToCombine);

  const productInputs = combinations.map((combination) => {
    const [almacenamientoId, ramId, colorId] = combination;
    return {
      ...restData,
      almacenamientoId: almacenamientoId ?? undefined,
      ramId: ramId ?? undefined,
      colorId: colorId ?? undefined,
    };
  });

  try {
    await createMultipleProducts(productInputs);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteProductAction(id: string): Promise<ActionResponse> {
  try {
    await deleteProduct(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function getProductsWithFiltersAction(
  filters?: ProductFilters,
  page?: number,
  pageSize?: number,
): Promise<
  | { success: true; data: ProductDTO[]; total: number }
  | { success: false; error: string }
> {
  try {
    const result = await listProducts({
      filters,
      page,
      pageSize,
    });
    return {
      success: true,
      data: result.products,
      total: result.total,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al obtener productos",
    };
  }
}

export async function getProductFilterOptionsAction() {
  try {
    return await getProductFilterOptions();
  } catch {
    throw new Error("No se pudieron cargar las opciones de filtro");
  }
}

/**
 * Genera el producto cartesiano de múltiples arrays
 * Ejemplo: cartesian([1,2], [3,4]) => [[1,3], [1,4], [2,3], [2,4]]
 */
function cartesian<T>(...arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) {
    const firstArray = arrays[0];
    return firstArray ? firstArray.map((item) => [item]) : [[]];
  }

  const [first, ...rest] = arrays;
  const restCartesian = cartesian(...rest);

  if (!first) return restCartesian;

  return first.flatMap((item) =>
    restCartesian.map((combination) => [item, ...combination]),
  );
}

"use server";

import { z } from "zod";
import {
  createBrand,
  deleteBrand,
  updateBrand,
} from "@/data/repositories/brands.repository";
import {
  createColor,
  deleteColor,
  updateColor,
} from "@/data/repositories/colors.repository";
import {
  createCostCenter,
  deleteCostCenter,
  updateCostCenter,
} from "@/data/repositories/costCenters.repository";
import {
  createProduct,
  deleteProduct,
  listProducts,
  type ProductDTO,
  updateProduct,
} from "@/data/repositories/master.products.repository";
import {
  createModel,
  deleteModel,
  updateModel,
} from "@/data/repositories/models.repository";
import {
  createRamOption,
  deleteRamOption,
  updateRamOption,
} from "@/data/repositories/ram.repository";
import {
  type BrandDTO,
  type ColorDTO,
  type CostCenterDTO,
  isPrismaKnownError,
  listBrands,
  listColors,
  listCostCenters,
  listModels,
  listRamOptions,
  listStorageOptions,
  listTipoProductos,
  type ModelDTO,
  type RamDTO,
  type StorageDTO,
  type TipoProductoDTO,
} from "@/data/repositories/shared.repository";
import {
  createStorageOption,
  deleteStorageOption,
  updateStorageOption,
} from "@/data/repositories/storage.repository";
import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  type SupplierDTO,
  updateSupplier,
} from "@/data/repositories/suppliers.repository";
import {
  createUser,
  deleteUser,
  listUsers,
  type UserDTO,
  updateUser,
} from "@/data/repositories/users.repository";
import {
  createWarehouse,
  deleteWarehouse,
  listWarehouses,
  updateWarehouse,
  type WarehouseDTO,
} from "@/data/repositories/warehouses.repository";
import type { MasterDataSection } from "@/features/master-data/conts";

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

// Suppliers
const supplierSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  contacto: z.string().min(1, "El contacto es obligatorio"),
  email: z.string().email("Correo inválido"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  direccion: z.string().optional(),
});

export async function upsertSupplierAction(
  values: z.infer<typeof supplierSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = supplierSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateSupplier(values.id, parsed.data);
    } else {
      await createSupplier(parsed.data);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteSupplierAction(
  id: string,
): Promise<ActionResponse> {
  try {
    await deleteSupplier(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

// Brands
const brandSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
});

export async function upsertBrandAction(
  values: z.infer<typeof brandSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = brandSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateBrand(values.id, parsed.data);
    } else {
      await createBrand(parsed.data);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteBrandAction(id: string): Promise<ActionResponse> {
  try {
    await deleteBrand(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

// Models
const modelSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  marcaId: z.string().uuid("Selecciona una marca válida"),
});

export async function upsertModelAction(
  values: z.infer<typeof modelSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = modelSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateModel(values.id, parsed.data);
    } else {
      await createModel(parsed.data);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteModelAction(id: string): Promise<ActionResponse> {
  try {
    await deleteModel(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

// Cost centers
const costCenterSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  responsable: z.string().optional(),
});

export async function upsertCostCenterAction(
  values: z.infer<typeof costCenterSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = costCenterSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateCostCenter(values.id, parsed.data);
    } else {
      await createCostCenter(parsed.data);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteCostCenterAction(
  id: string,
): Promise<ActionResponse> {
  try {
    await deleteCostCenter(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

// Warehouses
const warehouseSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  capacidad: z.string().optional(),
  responsable: z.string().optional(),
});

export async function upsertWarehouseAction(
  values: z.infer<typeof warehouseSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = warehouseSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateWarehouse(values.id, parsed.data);
    } else {
      await createWarehouse(parsed.data);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteWarehouseAction(
  id: string,
): Promise<ActionResponse> {
  try {
    await deleteWarehouse(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

// Users
const userSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido"),
  telefono: z.string().optional(),
  rol: z.string().min(1, "El rol es obligatorio"),
  centroCostoId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  estado: z.boolean().optional(),
});

export async function upsertUserAction(
  values: z.infer<typeof userSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = userSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateUser(values.id, parsed.data);
    } else {
      await createUser(parsed.data);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteUserAction(id: string): Promise<ActionResponse> {
  try {
    await deleteUser(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

// Colors
const colorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
});

export async function upsertColorAction(
  values: z.infer<typeof colorSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = colorSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateColor(values.id, parsed.data);
    } else {
      await createColor(parsed.data);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteColorAction(id: string): Promise<ActionResponse> {
  try {
    await deleteColor(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

// Storage
const storageSchema = z.object({
  capacidad: z
    .number()
    .int()
    .positive("La capacidad debe ser un número positivo"),
});

export async function upsertStorageAction(
  values: z.infer<typeof storageSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = storageSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateStorageOption(values.id, parsed.data);
    } else {
      await createStorageOption(parsed.data);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteStorageAction(id: string): Promise<ActionResponse> {
  try {
    await deleteStorageOption(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

// RAM
const ramSchema = z.object({
  capacidad: z
    .number()
    .int()
    .positive("La capacidad debe ser un número positivo"),
});

export async function upsertRamAction(
  values: z.infer<typeof ramSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = ramSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateRamOption(values.id, parsed.data);
    } else {
      await createRamOption(parsed.data);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteRamAction(id: string): Promise<ActionResponse> {
  try {
    await deleteRamOption(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

// Products
const productSchema = z.object({
  tipoProductoId: z.string().uuid("Selecciona un tipo de producto válido"),
  marcaId: z.string().uuid("Selecciona una marca válida"),
  modeloId: z.string().uuid("Selecciona un modelo válido"),
  almacenamientoId: z.string().uuid("Selecciona un almacenamiento válido"),
  ramId: z.string().uuid("Selecciona una RAM válida"),
  colorId: z.string().uuid("Selecciona un color válido"),
});

export async function upsertProductAction(
  values: z.infer<typeof productSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateProduct(values.id, parsed.data);
    } else {
      await createProduct(parsed.data);
    }
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

export type MasterDataPayload = {
  suppliers?: SupplierDTO[];
  brands?: BrandDTO[];
  models?: ModelDTO[];
  costCenters?: CostCenterDTO[];
  users?: UserDTO[];
  warehouses?: WarehouseDTO[];
  colors?: ColorDTO[];
  storageOptions?: StorageDTO[];
  ramOptions?: RamDTO[];
  tipoProductos?: TipoProductoDTO[];
  products?: ProductDTO[];
};

export async function getSectionData(
  section: MasterDataSection,
): Promise<MasterDataPayload> {
  switch (section) {
    case "proveedores":
      return {
        suppliers: await listSuppliers(),
      };
    case "marcas":
      return {
        brands: await listBrands(),
      };
    case "modelos": {
      const [models, brands] = await Promise.all([listModels(), listBrands()]);
      return { models, brands };
    }
    case "usuarios": {
      const [users, costCenters] = await Promise.all([
        listUsers(),
        listCostCenters(),
      ]);
      return { users, costCenters };
    }
    case "centros-costo":
      return {
        costCenters: await listCostCenters(),
      };
    case "bodegas":
      return {
        warehouses: await listWarehouses(),
      };
    case "colores":
      return {
        colors: await listColors(),
      };
    case "almacenamiento":
      return {
        storageOptions: await listStorageOptions(),
      };
    case "ram":
      return {
        ramOptions: await listRamOptions(),
      };
    case "tipo-productos":
      return {
        tipoProductos: await listTipoProductos(),
      };
    case "productos": {
      const [
        products,
        tipoProductos,
        brands,
        models,
        storageOptions,
        ramOptions,
        colors,
      ] = await Promise.all([
        listProducts(),
        listTipoProductos(),
        listBrands(),
        listModels(),
        listStorageOptions(),
        listRamOptions(),
        listColors(),
      ]);
      return {
        products,
        tipoProductos,
        brands,
        models,
        storageOptions,
        ramOptions,
        colors,
      };
    }
    default:
      return {};
  }
}

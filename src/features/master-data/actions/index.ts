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
  listProducts,
  type ProductDTO,
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
  getRoleById,
  getUserById,
  linkUserToAuthAccount,
  listRoles,
  listUsers,
  type RoleDTO,
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
import { CrudActionBuilder } from "@/lib/action-helpers";
import {
  createSupabaseMasterUser,
  deleteSupabaseMasterUser,
  resendInviteEmail,
  updateSupabaseMasterUser,
} from "@/services/supabase/users";
import {
  createProductsBatchAction as createProductsBatchActionInternal,
  deleteProductAction as deleteProductActionInternal,
  getProductFilterOptionsAction as getProductFilterOptionsActionInternal,
  getProductsWithFiltersAction as getProductsWithFiltersActionInternal,
  upsertProductAction as upsertProductActionInternal,
} from "../productos/actions/index";

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

function supabaseActionError(error: unknown): ActionResponse {
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("already been registered")) {
      return {
        success: false,
        error: "Ya existe un usuario con este correo electrónico",
      };
    }
    return {
      success: false,
      error: message,
    };
  }

  return {
    success: false,
    error: "Ocurrió un error al sincronizar con Supabase",
  };
}

// Reexportar acciones de productos manteniendo compatibilidad con server actions
export const upsertProductAction = upsertProductActionInternal;
export const deleteProductAction = deleteProductActionInternal;
export const getProductsWithFiltersAction =
  getProductsWithFiltersActionInternal;
export const getProductFilterOptionsAction =
  getProductFilterOptionsActionInternal;
export const createProductsBatchAction = createProductsBatchActionInternal;

// Suppliers
const supplierSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  contacto: z.string().min(1, "El contacto es obligatorio"),
  email: z.string().email("Correo inválido"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  direccion: z.string().optional(),
});

export const upsertSupplierAction = CrudActionBuilder.for(supplierSchema)
  .createWith(createSupplier)
  .updateWith(updateSupplier)
  .buildUpsertAction();

export const deleteSupplierAction = CrudActionBuilder.for(supplierSchema)
  .deleteWith(deleteSupplier)
  .buildDeleteAction();

// Brands
const brandSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
});

export const upsertBrandAction = CrudActionBuilder.for(brandSchema)
  .createWith(createBrand)
  .updateWith(updateBrand)
  .buildUpsertAction();

export const deleteBrandAction = CrudActionBuilder.for(brandSchema)
  .deleteWith(deleteBrand)
  .buildDeleteAction();

// Models
const modelSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  marcaId: z.string().uuid("Selecciona una marca válida"),
});

export const upsertModelAction = CrudActionBuilder.for(modelSchema)
  .createWith(createModel)
  .updateWith(updateModel)
  .buildUpsertAction();

export const deleteModelAction = CrudActionBuilder.for(modelSchema)
  .deleteWith(deleteModel)
  .buildDeleteAction();

// Cost centers
const costCenterSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  responsable: z.string().optional(),
});

export const upsertCostCenterAction = CrudActionBuilder.for(costCenterSchema)
  .createWith(createCostCenter)
  .updateWith(updateCostCenter)
  .buildUpsertAction();

export const deleteCostCenterAction = CrudActionBuilder.for(costCenterSchema)
  .deleteWith(deleteCostCenter)
  .buildDeleteAction();

// Warehouses
const warehouseSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  centroCostoId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const upsertWarehouseAction = CrudActionBuilder.for(warehouseSchema)
  .createWith(createWarehouse)
  .updateWith(updateWarehouse)
  .buildUpsertAction();

export const deleteWarehouseAction = CrudActionBuilder.for(warehouseSchema)
  .deleteWith(deleteWarehouse)
  .buildDeleteAction();

// Users
const userSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido"),
  telefono: z.string().optional(),
  rolId: z.string().uuid("Selecciona un rol válido"),
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

  const role = await getRoleById(parsed.data.rolId);
  if (!role) {
    return {
      success: false,
      error: "El rol seleccionado no existe",
    };
  }

  const parsedData = parsed.data;

  if (!values.id) {
    try {
      const user = await createUser(parsedData);
      try {
        const { authUserId } = await createSupabaseMasterUser({
          localUserId: user.id,
          email: user.email,
          fullName: user.nombre,
          phone: user.telefono ?? null,
          roleId: role.id,
          roleName: role.nombre,
          isActive: user.estado,
        });
        await linkUserToAuthAccount(user.id, authUserId);
        return { success: true };
      } catch (error) {
        await deleteUser(user.id).catch(() => {});
        return supabaseActionError(error);
      }
    } catch (error) {
      return prismaError(error);
    }
  }

  const existingUser = await getUserById(values.id);
  if (!existingUser) {
    return {
      success: false,
      error: "El usuario no existe",
    };
  }

  const supabasePayload = {
    localUserId: existingUser.id,
    email: parsedData.email,
    fullName: parsedData.nombre,
    phone: parsedData.telefono ?? null,
    roleId: role.id,
    roleName: role.nombre,
    isActive:
      typeof parsedData.estado === "boolean"
        ? parsedData.estado
        : existingUser.estado,
  };

  try {
    let authUserId = existingUser.authUserId ?? null;
    let createdAuthAccount = false;

    if (authUserId) {
      await updateSupabaseMasterUser(authUserId, supabasePayload);
    } else {
      const result = await createSupabaseMasterUser(supabasePayload);
      authUserId = result.authUserId;
      createdAuthAccount = true;
    }

    try {
      await updateUser(values.id, parsedData);
      if (createdAuthAccount && authUserId) {
        await linkUserToAuthAccount(values.id, authUserId);
      }
      return { success: true };
    } catch (error) {
      if (createdAuthAccount && authUserId) {
        await deleteSupabaseMasterUser(authUserId).catch(() => {});
      } else if (existingUser.authUserId) {
        await updateSupabaseMasterUser(existingUser.authUserId, {
          localUserId: existingUser.id,
          email: existingUser.email,
          fullName: existingUser.nombre,
          phone: existingUser.telefono ?? null,
          roleId: existingUser.rolId ?? role.id,
          roleName: existingUser.rolNombre ?? role.nombre,
          isActive: existingUser.estado,
        }).catch(() => {});
      }
      return prismaError(error);
    }
  } catch (error) {
    return supabaseActionError(error);
  }
}

export async function deleteUserAction(id: string): Promise<ActionResponse> {
  const existingUser = await getUserById(id);
  if (!existingUser) {
    return {
      success: false,
      error: "El usuario no existe",
    };
  }

  let supabaseAccountDeleted = false;
  if (existingUser.authUserId) {
    try {
      await deleteSupabaseMasterUser(existingUser.authUserId);
      supabaseAccountDeleted = true;
    } catch (error) {
      return supabaseActionError(error);
    }
  }

  try {
    await deleteUser(id);
    return { success: true };
  } catch (error) {
    if (supabaseAccountDeleted && existingUser.rolId) {
      try {
        const roleName =
          existingUser.rolNombre ??
          (await getRoleById(existingUser.rolId))?.nombre ??
          undefined;
        const { authUserId } = await createSupabaseMasterUser({
          localUserId: existingUser.id,
          email: existingUser.email,
          fullName: existingUser.nombre,
          phone: existingUser.telefono ?? null,
          roleId: existingUser.rolId,
          roleName,
          isActive: existingUser.estado,
        });
        await linkUserToAuthAccount(existingUser.id, authUserId);
      } catch {
        // Ignorar el rollback si falla: ya estamos devolviendo error al usuario.
      }
    }
    return prismaError(error);
  }
}

export async function resendInviteAction(id: string): Promise<ActionResponse> {
  const existingUser = await getUserById(id);
  if (!existingUser) {
    return {
      success: false,
      error: "El usuario no existe",
    };
  }

  if (!existingUser.rolId) {
    return {
      success: false,
      error: "El usuario no tiene un rol asignado",
    };
  }

  const role = await getRoleById(existingUser.rolId);
  if (!role) {
    return {
      success: false,
      error: "El rol del usuario no existe",
    };
  }

  try {
    await resendInviteEmail(
      {
        localUserId: existingUser.id,
        email: existingUser.email,
        fullName: existingUser.nombre,
        phone: existingUser.telefono ?? null,
        roleId: role.id,
        roleName: role.nombre,
        isActive: existingUser.estado,
      },
      existingUser.authUserId ?? undefined,
    );

    // Si el usuario tiene authUserId, actualizamos los metadatos para asegurar consistencia
    if (existingUser.authUserId) {
      try {
        await updateSupabaseMasterUser(existingUser.authUserId, {
          localUserId: existingUser.id,
          email: existingUser.email,
          fullName: existingUser.nombre,
          phone: existingUser.telefono ?? null,
          roleId: role.id,
          roleName: role.nombre,
          isActive: existingUser.estado,
        });
      } catch {
        // Si falla la actualización de metadatos, no es crítico, el correo ya se envió
      }
    }

    return { success: true };
  } catch (error) {
    return supabaseActionError(error);
  }
}

// Colors
const colorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
});

export const upsertColorAction = CrudActionBuilder.for(colorSchema)
  .createWith(createColor)
  .updateWith(updateColor)
  .buildUpsertAction();

export const deleteColorAction = CrudActionBuilder.for(colorSchema)
  .deleteWith(deleteColor)
  .buildDeleteAction();

// Storage
const storageSchema = z.object({
  capacidad: z
    .number()
    .int()
    .positive("La capacidad debe ser un número positivo"),
});

export const upsertStorageAction = CrudActionBuilder.for(storageSchema)
  .createWith(createStorageOption)
  .updateWith(updateStorageOption)
  .buildUpsertAction();

export const deleteStorageAction = CrudActionBuilder.for(storageSchema)
  .deleteWith(deleteStorageOption)
  .buildDeleteAction();

// RAM
const ramSchema = z.object({
  capacidad: z
    .number()
    .int()
    .positive("La capacidad debe ser un número positivo"),
});

export const upsertRamAction = CrudActionBuilder.for(ramSchema)
  .createWith(createRamOption)
  .updateWith(updateRamOption)
  .buildUpsertAction();

export const deleteRamAction = CrudActionBuilder.for(ramSchema)
  .deleteWith(deleteRamOption)
  .buildDeleteAction();

export type MasterDataPayload = {
  suppliers?: SupplierDTO[];
  brands?: BrandDTO[];
  models?: ModelDTO[];
  costCenters?: CostCenterDTO[];
  users?: UserDTO[];
  roles?: RoleDTO[];
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
      const [users, costCenters, roles] = await Promise.all([
        listUsers(),
        listCostCenters(),
        listRoles(),
      ]);
      return { users, costCenters, roles };
    }
    case "centros-costo":
      return {
        costCenters: await listCostCenters(),
      };
    case "bodegas": {
      const [warehouses, costCenters] = await Promise.all([
        listWarehouses(),
        listCostCenters(),
      ]);
      return { warehouses, costCenters };
    }
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
        productsResult,
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
        products: productsResult.products,
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

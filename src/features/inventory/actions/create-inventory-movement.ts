"use server";

import { z } from "zod";
import {
  createInventoryMovementWithDetails,
  getInventoryMovementTypeById,
} from "@/data/repositories/inventory.movements.repository";

const schema = z.object({
  product: z.string().uuid("El producto es requerido"),
  movementType: z.string().uuid("El tipo de movimiento es requerido"),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  cost: z.coerce.number().nonnegative("El costo no puede ser negativo"),
  imeis: z.string().optional(),
  warehouse: z
    .string()
    .uuid("Bodega inválida")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  supplier: z
    .string()
    .uuid("Proveedor inválido")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});

export async function createInventoryMovementAction(formData: FormData) {
  const warehouseValue = formData.get("warehouse");
  const supplierValue = formData.get("supplier");

  const parsed = schema.safeParse({
    product: formData.get("product"),
    movementType: formData.get("movementType"),
    quantity: formData.get("quantity"),
    cost: formData.get("cost"),
    imeis: formData.get("imeis"),
    warehouse: warehouseValue || "",
    supplier: supplierValue || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid data",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { product, movementType, quantity, cost, imeis, warehouse, supplier } =
    parsed.data;

  const imeiList =
    imeis
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const movementTypeRecord = await getInventoryMovementTypeById(movementType);
  if (!movementTypeRecord) {
    return {
      success: false,
      error: "Tipo de movimiento no válido",
    };
  }

  if (
    movementTypeRecord.ingreso &&
    imeiList.length > 0 &&
    imeiList.length !== quantity
  ) {
    return {
      success: false,
      error: "La cantidad de IMEIs no coincide con la cantidad del movimiento",
    };
  }

  try {
    await createInventoryMovementWithDetails({
      productId: product,
      movementTypeId: movementType,
      quantity,
      unitCost: cost,
      imeis: imeiList,
      warehouseId: warehouse || undefined,
      supplierId: supplier || undefined,
    });

    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al crear el movimiento",
    };
  }
}

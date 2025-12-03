"use server";

import { z } from "zod";
import {
  createInventoryMovementWithDetails,
  getInventoryMovementTypeById,
} from "@/data/repositories/inventory.movements.repository";
import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";

// Schema base con campos opcionales
const baseSchema = z.object({
  product: z
    .string()
    .uuid("El producto es inválido")
    .optional()
    .or(z.literal("")),
  movementType: z.string().uuid("El tipo de movimiento es requerido"),
  quantity: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : undefined)),
  cost: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseFloat(val) : undefined)),
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
  pvp: z
    .string()
    .optional()
    .transform((val) =>
      val && val.trim() !== "" ? Number.parseFloat(val) : undefined,
    ),
  comentario: z.string().optional(),
});

export async function createInventoryMovementAction(formData: FormData) {
  // Obtener usuario actual
  const currentUser = await getCurrentUserWithRole();
  if (!currentUser) {
    return {
      success: false,
      error: "Usuario no autenticado",
    };
  }

  const warehouseValue = formData.get("warehouse");
  const supplierValue = formData.get("supplier");
  const productValue = formData.get("product");
  const costValue = formData.get("cost");
  const quantityValue = formData.get("quantity");
  const pvpValue = formData.get("pvp");
  const comentarioValue = formData.get("comentario");

  const parsed = baseSchema.safeParse({
    product: productValue?.toString() || "",
    movementType: formData.get("movementType"),
    quantity: quantityValue?.toString() || "",
    cost: costValue?.toString() || "",
    imeis: formData.get("imeis")?.toString() || "",
    warehouse: warehouseValue?.toString() || "",
    supplier: supplierValue?.toString() || "",
    pvp: pvpValue?.toString() || "",
    comentario: comentarioValue?.toString() || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid data",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    product,
    movementType,
    quantity,
    cost,
    imeis,
    warehouse,
    supplier,
    pvp,
    comentario,
  } = parsed.data;

  // Obtener el tipo de movimiento para validación condicional
  const movementTypeRecord = await getInventoryMovementTypeById(movementType);
  if (!movementTypeRecord) {
    return {
      success: false,
      error: "Tipo de movimiento no válido",
    };
  }

  const isHorizontal =
    !movementTypeRecord.ingreso && !movementTypeRecord.salida;

  // Procesar IMEIs
  const imeiList =
    imeis
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  // Validación condicional según el tipo de movimiento
  if (isHorizontal) {
    // Movimientos horizontales: requieren IMEIs y bodega
    if (imeiList.length === 0) {
      return {
        success: false,
        error: "Los IMEIs son requeridos para movimientos horizontales",
        errors: {
          imeis: ["Debe ingresar al menos un IMEI"],
        },
      };
    }

    if (!warehouse) {
      return {
        success: false,
        error: "La bodega es requerida para movimientos horizontales",
        errors: {
          warehouse: ["La bodega es requerida"],
        },
      };
    }

    // Para movimientos horizontales, calcular quantity desde los IMEIs si no se proporciona
    const calculatedQuantity = quantity ?? imeiList.length;

    // El producto se obtendrá desde los IMEIs en el repository si no se proporciona
    try {
      await createInventoryMovementWithDetails({
        productId: product || "", // Se obtendrá desde IMEIs en el repository si está vacío
        movementTypeId: movementType,
        quantity: calculatedQuantity,
        unitCost: cost, // Opcional para horizontales
        imeis: imeiList,
        warehouseId: warehouse,
        supplierId: supplier || undefined,
        pvp: pvp, // Opcional
        comentario: comentario?.trim() || undefined,
        creadoPorId: currentUser.id,
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
  } else {
    // Movimientos de ingreso o salida: requieren product, cost, quantity
    if (!product) {
      return {
        success: false,
        error: "El producto es requerido",
        errors: {
          product: ["El producto es requerido"],
        },
      };
    }

    if (cost === undefined || cost === null) {
      return {
        success: false,
        error: "El costo es requerido",
        errors: {
          cost: ["El costo es requerido"],
        },
      };
    }

    if (cost < 0) {
      return {
        success: false,
        error: "El costo no puede ser negativo",
        errors: {
          cost: ["El costo no puede ser negativo"],
        },
      };
    }

    if (quantity === undefined || quantity === null) {
      return {
        success: false,
        error: "La cantidad es requerida",
        errors: {
          quantity: ["La cantidad es requerida"],
        },
      };
    }

    if (quantity <= 0) {
      return {
        success: false,
        error: "La cantidad debe ser mayor a 0",
        errors: {
          quantity: ["La cantidad debe ser mayor a 0"],
        },
      };
    }

    // Validar IMEIs para movimientos de ingreso
    // Si se proporcionan IMEIs, deben coincidir con la cantidad (los faltantes se generan automáticamente)
    // Si no se proporcionan IMEIs, se generan automáticamente para todas las unidades
    if (
      movementTypeRecord.ingreso &&
      imeiList.length > 0 &&
      imeiList.length > quantity
    ) {
      return {
        success: false,
        error:
          "La cantidad de IMEIs no puede ser mayor que la cantidad del movimiento",
      };
    }

    // Validar PVP si se proporciona (solo para movimientos de ingreso)
    if (pvp !== undefined && pvp !== null) {
      if (pvp < 0) {
        return {
          success: false,
          error: "El PVP no puede ser negativo",
          errors: {
            pvp: ["El PVP no puede ser negativo"],
          },
        };
      }
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
        pvp: pvp, // Opcional, solo para movimientos de ingreso
        comentario: comentario?.trim() || undefined,
        creadoPorId: currentUser.id,
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
}

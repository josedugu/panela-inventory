import { z } from "zod";

// Tipo para el movimiento (usado para validación condicional)
export interface MovementTypeInfo {
  id: string;
  ingreso: boolean;
  salida: boolean;
}

// Schema base
const baseSchema = z.object({
  product: z.string().optional(),
  movementType: z.string().uuid("El tipo de movimiento es requerido"),
  cost: z.string().optional(),
  quantity: z.string().optional(),
  imeis: z.string().optional(),
  warehouse: z.string().optional(),
  supplier: z.string().optional(),
});

// Función para crear schema con validación condicional
export function createInventoryMovementFormSchema(
  movementTypeInfo?: MovementTypeInfo | null,
) {
  return baseSchema.superRefine((data, ctx) => {
    // El tipo de movimiento siempre es requerido
    if (!data.movementType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El tipo de movimiento es requerido",
        path: ["movementType"],
      });
      return;
    }

    // Si no tenemos información del tipo de movimiento, solo validamos formato
    if (!movementTypeInfo) {
      // Validación básica de formato
      if (data.cost && data.cost.trim() !== "") {
        const costNum = Number.parseFloat(data.cost);
        if (Number.isNaN(costNum) || costNum < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El costo no puede ser negativo",
            path: ["cost"],
          });
        }
      }

      if (data.quantity && data.quantity.trim() !== "") {
        const quantityNum = Number.parseInt(data.quantity, 10);
        if (Number.isNaN(quantityNum) || quantityNum <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La cantidad debe ser mayor a 0",
            path: ["quantity"],
          });
        }
      }
      return;
    }

    const isHorizontal = !movementTypeInfo.ingreso && !movementTypeInfo.salida;

    // Validación para movimientos horizontales (cambio de bodega)
    if (isHorizontal) {
      // Requiere: IMEIs y Bodega
      if (!data.imeis || data.imeis.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Los IMEIs son requeridos para movimientos horizontales",
          path: ["imeis"],
        });
      } else {
        const imeiList = data.imeis
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (imeiList.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Debe ingresar al menos un IMEI",
            path: ["imeis"],
          });
        }
      }

      if (!data.warehouse || data.warehouse.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La bodega es requerida para movimientos horizontales",
          path: ["warehouse"],
        });
      }
    } else {
      // Validación para movimientos de ingreso o salida
      // Requiere: product, cost, quantity
      if (!data.product || data.product.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El producto es requerido",
          path: ["product"],
        });
      }

      if (!data.cost || data.cost.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El costo es requerido",
          path: ["cost"],
        });
      } else {
        const costNum = Number.parseFloat(data.cost);
        if (Number.isNaN(costNum) || costNum < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El costo no puede ser negativo",
            path: ["cost"],
          });
        }
      }

      if (!data.quantity || data.quantity.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La cantidad es requerida",
          path: ["quantity"],
        });
      } else {
        const quantityNum = Number.parseInt(data.quantity, 10);
        if (Number.isNaN(quantityNum) || quantityNum <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La cantidad debe ser mayor a 0",
            path: ["quantity"],
          });
        }
      }
    }
  });
}

// Schema por defecto (sin validación condicional, se valida en servidor)
export const inventoryMovementFormSchema = baseSchema;

export type InventoryMovementFormValues = z.infer<
  typeof inventoryMovementFormSchema
>;

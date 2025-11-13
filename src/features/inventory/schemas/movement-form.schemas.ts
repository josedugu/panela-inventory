import { z } from "zod";

export const inventoryMovementFormSchema = z.object({
  product: z.string().uuid("El producto es requerido"),
  movementType: z.string().uuid("El tipo de movimiento es requerido"),
  cost: z
    .string()
    .min(1, "El costo es requerido")
    .refine(
      (val) => {
        const num = Number.parseFloat(val);
        return !Number.isNaN(num) && num >= 0;
      },
      { message: "El costo no puede ser negativo" },
    ),
  quantity: z
    .string()
    .min(1, "La cantidad es requerida")
    .refine(
      (val) => {
        const num = Number.parseInt(val, 10);
        return !Number.isNaN(num) && num > 0;
      },
      { message: "La cantidad debe ser mayor a 0" },
    ),
  imeis: z.string().optional(),
  warehouse: z.string().optional(),
  supplier: z.string().optional(),
});

export type InventoryMovementFormValues = z.infer<
  typeof inventoryMovementFormSchema
>;

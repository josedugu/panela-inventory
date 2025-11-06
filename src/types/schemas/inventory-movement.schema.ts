import { z } from "zod";

const positiveNumberFromString = z.preprocess((value) => {
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}, z.number().positive("El costo unitario debe ser mayor a cero"));

const positiveIntFromString = z.preprocess((value) => {
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}, z.number().int().positive("La cantidad debe ser mayor que cero"));

export const inventoryMovementSchema = z.object({
  productId: z
    .string({ required_error: "El producto es requerido" })
    .uuid("Producto inválido"),
  movementTypeId: z
    .string({ required_error: "El tipo de movimiento es requerido" })
    .uuid("Tipo de movimiento inválido"),
  unitCost: positiveNumberFromString,
  quantity: positiveIntFromString.optional(),
  imeis: z
    .string()
    .optional()
    .transform((value) => value ?? ""),
});

export type InventoryMovementInput = z.infer<typeof inventoryMovementSchema>;

import { z } from "zod";

export const warehouseFormSchema = z.object({
  codigo: z.string().min(1, "Código requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  centroCostoId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

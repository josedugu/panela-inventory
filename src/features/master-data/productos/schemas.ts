import { z } from "zod";

export const productFormSchema = z.object({
  tipoProductoId: z.string().uuid("Selecciona un tipo de producto válido"),
  marcaId: z.string().uuid("Selecciona una marca válida"),
  modeloId: z.string().uuid("Selecciona un modelo válido"),
  almacenamientoId: z.string().uuid("Selecciona un almacenamiento válido"),
  ramId: z.string().uuid("Selecciona una RAM válida"),
  colorId: z.string().uuid("Selecciona un color válido"),
  pvp: z.string().optional(),
  descripcion: z.string().optional(),
  estado: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

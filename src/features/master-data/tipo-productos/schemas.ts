import { z } from "zod";

export const tipoProductoFormSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  productoBaseParaOferta: z.boolean().default(false),
});

export type TipoProductoFormValues = z.infer<typeof tipoProductoFormSchema>;

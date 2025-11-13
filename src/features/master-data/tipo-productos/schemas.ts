import { z } from "zod";

export const tipoProductoFormSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
});

export type TipoProductoFormValues = z.infer<typeof tipoProductoFormSchema>;

import { z } from "zod";

export const brandFormSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

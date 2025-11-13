import { z } from "zod";

export const modelFormSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  marcaId: z.string().min(1, "Marca requerida"),
});

export type ModelFormValues = z.infer<typeof modelFormSchema>;

import { z } from "zod";

export const colorFormSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
});

export type ColorFormValues = z.infer<typeof colorFormSchema>;

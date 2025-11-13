import { z } from "zod";

export const customerFormSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  direccion: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

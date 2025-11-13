import { z } from "zod";

export const supplierFormSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  contacto: z.string().min(1, "Persona de contacto requerida"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "Teléfono requerido"),
  direccion: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

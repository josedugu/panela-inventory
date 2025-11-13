import { z } from "zod";

export const userFormSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  rolId: z.string().uuid("Selecciona un rol válido"),
  centroCostoId: z.string().optional(),
  estado: z.enum(["activo", "inactivo"]),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

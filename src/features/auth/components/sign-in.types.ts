import { z } from "zod";

/**
 * Esquema de validación para el formulario de inicio de sesión usando Zod.
 */
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es obligatorio" })
    .email({ message: "Debe ser un correo electrónico válido" }),
  password: z
    .string()
    .min(1, { message: "La contraseña es obligatoria" })
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

/**
 * Infiere el tipo de los datos del formulario desde el esquema de Zod.
 */
export type SignInFormData = z.infer<typeof signInSchema>;

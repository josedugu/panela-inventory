import { z } from "zod";

/**
 * Esquema de validación para el formulario de establecer contraseña usando Zod.
 */
export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // Asigna el error al campo de confirmación
  });

/**
 * Infiere el tipo de los datos del formulario desde el esquema de Zod.
 */
export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

/**
 * Define los posibles estados del flujo de autenticación.
 */
export type AuthStatus =
  | "VALIDATING"
  | "READY_TO_SET_PASSWORD"
  | "SUBMITTING"
  | "SUCCESS"
  | "INVALID_LINK";

/**
 * Props para el componente orquestador SetPassword.
 */
export interface SetPasswordProps {
  onSuccess: () => void;
  onNavigateToSignIn: () => void;
}

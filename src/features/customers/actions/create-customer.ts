"use server";

import { z } from "zod";
import { createCustomer } from "@/data/repositories/customers.repository";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido"),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  direccion: z.string().optional(),
});

export async function createCustomerAction(formData: FormData) {
  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    whatsapp: formData.get("whatsapp"),
    direccion: formData.get("direccion"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createCustomer(parsed.data);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al crear el cliente",
    };
  }
}

"use server";

import { z } from "zod";
import { isPrismaKnownError } from "@/data/repositories/shared.repository";
import {
  createTipoProducto,
  deleteTipoProducto,
  updateTipoProducto,
} from "@/data/repositories/tipo-producto.repository";

type ActionResponse =
  | { success: true }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

function validationError(
  errors: Record<string, string[] | undefined>,
): ActionResponse {
  return {
    success: false,
    error: "Revisa los datos ingresados",
    fieldErrors: errors,
  };
}

function prismaError(error: unknown): ActionResponse {
  if (isPrismaKnownError(error)) {
    if (error.code === "P2002") {
      return {
        success: false,
        error: "Ya existe un registro con los datos proporcionados",
      };
    }
    if (error.code === "P2003") {
      return {
        success: false,
        error:
          "No se puede eliminar el registro porque está asociado a otros datos",
      };
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: "Ocurrió un error inesperado",
  };
}

const tipoProductoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
});

export async function upsertTipoProductoAction(
  values: z.infer<typeof tipoProductoSchema> & { id?: string },
): Promise<ActionResponse> {
  const parsed = tipoProductoSchema.safeParse(values);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    if (values.id) {
      await updateTipoProducto(values.id, parsed.data);
    } else {
      await createTipoProducto(parsed.data);
    }
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

export async function deleteTipoProductoAction(
  id: string,
): Promise<ActionResponse> {
  try {
    await deleteTipoProducto(id);
    return { success: true };
  } catch (error) {
    return prismaError(error);
  }
}

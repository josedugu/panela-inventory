"use server";

import { revalidatePath } from "next/cache";
import {
  createProductDetail,
  findOrCreateProduct,
} from "@/data/repositories/products.repository";
import { productSchema } from "@/types/schemas/product.schema";

export async function createProductAction(formData: FormData) {
  const imei =
    typeof formData.get("imei") === "string"
      ? (formData.get("imei") as string)
      : undefined;

  const rawData = {
    costo: formData.get("costo")
      ? (formData.get("costo") as string)
      : undefined,
    descripcion: formData.get("descripcion") as string | undefined,
    tipoProductoId: formData.get("tipoProductoId") as string | undefined,
    imagenUrl: formData.get("imagenUrl") as string | undefined,
    marcaId: formData.get("marcaId") as string | undefined,
    modeloId: formData.get("modeloId") as string | undefined,
    cantidad: formData.get("cantidad")
      ? parseInt(formData.get("cantidad") as string, 10)
      : undefined,
    estado:
      formData.get("estado") === "true" ||
      formData.get("estado") === "on" ||
      formData.get("estado") === "1"
        ? true
        : formData.get("estado") === "false" || formData.get("estado") === "0"
          ? false
          : undefined,
  };

  const validatedData = productSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Datos inválidos",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  // Validar que se proporcione IMEI (requerido para crear un detalle)
  if (!imei || imei.trim().length === 0) {
    return {
      success: false,
      error: "El IMEI es requerido para crear un detalle de producto",
    };
  }

  try {
    // Buscar o crear el producto basado en sus características
    const { id: productId } = await findOrCreateProduct({
      costo: validatedData.data.costo,
      descripcion: validatedData.data.descripcion,
      tipoProductoId: validatedData.data.tipoProductoId,
      imagenUrl: validatedData.data.imagenUrl,
      marcaId: validatedData.data.marcaId,
      modeloId: validatedData.data.modeloId,
      estado: validatedData.data.estado,
    });

    // Crear el detalle de producto (esto es lo principal ahora)
    const productDetail = await createProductDetail({
      productId,
      imei: imei.trim(),
      name: validatedData.data.descripcion ?? undefined,
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/inventory/manage");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: productDetail,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al crear el detalle de producto",
    };
  }
}

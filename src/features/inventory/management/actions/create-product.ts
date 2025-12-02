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

    // Crear el detalle de producto (el IMEI se genera automáticamente si no se proporciona)
    const productDetail = await createProductDetail({
      productId,
      imei: imei,
      name: validatedData.data.descripcion ?? undefined,
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/inventory/search");
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

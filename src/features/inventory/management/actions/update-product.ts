"use server";

import { revalidatePath } from "next/cache";
import { updateProduct } from "@/data/repositories/products.repository";
import { updateProductSchema } from "@/types/schemas/product.schema";

export async function updateProductAction(id: string, formData: FormData) {
  const rawData = {
    costo: formData.get("costo")
      ? (formData.get("costo") as string)
      : undefined,
    descripcion: formData.get("descripcion") as string | undefined,
    tipoProductoId: formData.get("tipoProductoId") as string | undefined,
    imagenUrl: formData.get("imagenUrl") as string | undefined,
    marcaId: formData.get("marcaId") as string | undefined,
    modeloId: formData.get("modeloId") as string | undefined,
    bodegaId: formData.get("bodegaId") as string | undefined,
    proveedorId: formData.get("proveedorId") as string | undefined,
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

  const validatedData = updateProductSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Datos inválidos",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (validatedData.data.costo !== undefined)
      updateData.costo = validatedData.data.costo;
    if (validatedData.data.descripcion !== undefined)
      updateData.descripcion = validatedData.data.descripcion;
    if (validatedData.data.tipoProductoId !== undefined)
      updateData.tipoProductoId = validatedData.data.tipoProductoId;
    if (validatedData.data.imagenUrl !== undefined)
      updateData.imagenUrl = validatedData.data.imagenUrl;
    if (validatedData.data.marcaId !== undefined)
      updateData.marcaId = validatedData.data.marcaId;
    if (validatedData.data.modeloId !== undefined)
      updateData.modeloId = validatedData.data.modeloId;
    if (validatedData.data.bodegaId !== undefined)
      updateData.bodegaId = validatedData.data.bodegaId;
    if (validatedData.data.proveedorId !== undefined)
      updateData.proveedorId = validatedData.data.proveedorId;
    if (validatedData.data.cantidad !== undefined)
      updateData.cantidad = validatedData.data.cantidad;
    if (validatedData.data.estado !== undefined)
      updateData.estado = validatedData.data.estado;

    const product = await updateProduct(id, updateData);

    revalidatePath("/dashboard/inventory");
    revalidatePath(`/dashboard/inventory/${id}`);

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar el producto",
    };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import {
  createProduct,
  updateInventory,
} from "@/data/repositories/products.repository";
import { productSchema } from "@/types/schemas/product.schema";

export async function createProductAction(formData: FormData) {
  const rawData = {
    imei: formData.get("imei") as string | undefined,
    precio: formData.get("precio")
      ? (formData.get("precio") as string)
      : undefined,
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

  const validatedData = productSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Datos inválidos",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    const product = await createProduct({
      imei: validatedData.data.imei,
      precio: validatedData.data.precio,
      costo: validatedData.data.costo,
      descripcion: validatedData.data.descripcion,
      tipoProductoId: validatedData.data.tipoProductoId,
      imagenUrl: validatedData.data.imagenUrl,
      marcaId: validatedData.data.marcaId,
      modeloId: validatedData.data.modeloId,
      bodegaId: validatedData.data.bodegaId,
      proveedorId: validatedData.data.proveedorId,
      estado: validatedData.data.estado,
    });

    // Actualizar inventario si se proporciona cantidad
    if (validatedData.data.cantidad !== undefined) {
      await updateInventory(product.id, validatedData.data.cantidad);
    }

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Error creando producto:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al crear el producto",
    };
  }
}

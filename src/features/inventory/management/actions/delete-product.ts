"use server";

import { revalidatePath } from "next/cache";
import { deleteProductDetail } from "@/data/repositories/products.repository";

export async function deleteProductAction(id: string) {
  try {
    // id es el ID del ProductoDetalle, no del Producto
    await deleteProductDetail(id);

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/inventory/manage");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete product detail",
    };
  }
}

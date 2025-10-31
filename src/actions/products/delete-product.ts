"use server";

import { deleteProduct } from "@/data/repositories/products.repository";
import { revalidatePath } from "next/cache";

export async function deleteProductAction(id: string) {
  try {
    await deleteProduct(id);

    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { deleteProduct } from "@/data/repositories/products.repository";

export async function deleteProductAction(id: string) {
  try {
    await deleteProduct(id);

    revalidatePath("/dashboard/inventory");
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

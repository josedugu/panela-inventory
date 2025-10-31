"use server";

import { updateProduct } from "@/data/repositories/products.repository";
import { revalidatePath } from "next/cache";
import { updateProductSchema } from "@/types/schemas/product.schema";

export async function updateProductAction(id: string, formData: FormData) {
  const rawData = {
    name: formData.get("name") as string | undefined,
    sku: formData.get("sku") as string | undefined,
    price: formData.get("price")
      ? parseFloat(formData.get("price") as string)
      : undefined,
    description: formData.get("description") as string | undefined,
    categoryId: formData.get("categoryId") as string | undefined,
  };

  const validatedData = updateProductSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Invalid data",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    const product = await updateProduct(id, {
      name: validatedData.data.name,
      sku: validatedData.data.sku,
      price: validatedData.data.price,
      description: validatedData.data.description,
      category_id: validatedData.data.categoryId,
    });

    revalidatePath("/inventory");
    revalidatePath(`/inventory/${id}`);

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

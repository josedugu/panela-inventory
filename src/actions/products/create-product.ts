"use server";

import {
  createProduct,
  updateInventory,
} from "@/data/repositories/products.repository";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/types/schemas/product.schema";

export async function createProductAction(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    sku: formData.get("sku") as string,
    price: parseFloat(formData.get("price") as string),
    description: formData.get("description") as string | undefined,
    categoryId: formData.get("categoryId") as string | undefined,
    stock: formData.get("stock")
      ? parseInt(formData.get("stock") as string)
      : 0,
  };

  const validatedData = productSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Invalid data",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    const product = await createProduct({
      name: validatedData.data.name,
      sku: validatedData.data.sku,
      price: validatedData.data.price,
      description: validatedData.data.description,
      category_id: validatedData.data.categoryId,
    });

    // Create inventory entry if stock is provided
    if (validatedData.data.stock !== undefined) {
      await updateInventory(product.id, validatedData.data.stock);
    }

    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create product",
    };
  }
}

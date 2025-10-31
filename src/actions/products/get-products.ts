"use server";

import { getAllProducts } from "@/data/repositories/products.repository";

export async function getProductsAction() {
  try {
    const products = await getAllProducts();
    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Failed to fetch products",
    };
  }
}

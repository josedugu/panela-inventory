import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  sku: z.string().min(1, "SKU is required").max(50),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const updateProductSchema = productSchema.partial();

export type ProductUpdate = z.infer<typeof updateProductSchema>;

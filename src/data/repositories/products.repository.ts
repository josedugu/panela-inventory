import { createClient } from "@/lib/supabase/server";

export async function getAllProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      inventory(*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      inventory(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function searchProducts(query: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(
      `name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`
    );

  if (error) throw error;
  return data;
}

export async function getLowStockProducts(threshold: number = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      inventory!inner(quantity)
    `
    )
    .lte("inventory.quantity", threshold)
    .order("inventory.quantity", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createProduct(productData: {
  name: string;
  sku: string;
  description?: string;
  price: number;
  category_id?: string;
  image_url?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  updates: {
    name?: string;
    sku?: string;
    description?: string;
    price?: number;
    category_id?: string;
    image_url?: string;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;
}

// Inventory operations
export async function updateInventory(
  productId: string,
  quantity: number,
  lowStockThreshold?: number
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory")
    .upsert({
      product_id: productId,
      quantity,
      low_stock_threshold: lowStockThreshold ?? 10,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

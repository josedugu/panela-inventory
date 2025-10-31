import { createClient } from "@/lib/supabase/server";

export async function getDashboardMetrics() {
  const supabase = await createClient();

  // Get total products
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  // Get total inventory value using RPC function
  const { data: inventoryValue } = await supabase.rpc(
    "calculate_inventory_value"
  );

  // Get low stock count
  const { count: lowStockCount } = await supabase
    .from("inventory")
    .select("*", { count: "exact", head: true })
    .lte("quantity", 10);

  // Get total stock quantity
  const { data: inventoryData } = await supabase
    .from("inventory")
    .select("quantity");

  const totalStock =
    inventoryData?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    totalProducts: totalProducts ?? 0,
    inventoryValue: inventoryValue ?? 0,
    lowStockCount: lowStockCount ?? 0,
    totalStock,
  };
}

export async function getRecentActivity() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

import { createClient } from "@/lib/supabase/server";

export async function getAllCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCategoryById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCategory(categoryData: {
  name: string;
  description?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .insert(categoryData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

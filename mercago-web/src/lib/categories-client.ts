"use client";

import { createClient } from "@/lib/supabase/client";
import type { Category, CategoryField } from "@/lib/types/category";

// Variantes para cliente (formularios interactivos: publicar/editar anuncio).
// Separadas de categories.ts a propósito: ese archivo usa next/headers
// (Server Components) y no debe importarse nunca desde un "use client".
export async function fetchCategoriesClient(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase
    .schema("app_mercago")
    .from("categories")
    .select("id, slug, name, parent_id, icon, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function fetchCategoryFieldsClient(categoryId: string): Promise<CategoryField[]> {
  const supabase = createClient();
  const { data } = await supabase
    .schema("app_mercago")
    .from("category_fields")
    .select("id, category_id, key, label, field_type, options, is_required, sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

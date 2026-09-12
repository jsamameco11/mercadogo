import { createClient } from "@/lib/supabase/server";
import type { Category, CategoryField } from "@/lib/types/category";

export async function fetchCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("app_mercago")
    .from("categories")
    .select("id, slug, name, parent_id, icon, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("fetchCategories", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("app_mercago")
    .from("categories")
    .select("id, slug, name, parent_id, icon, sort_order, is_active")
    .eq("slug", slug)
    .maybeSingle();
  return data ?? null;
}

export async function fetchCategoryFields(categoryId: string): Promise<CategoryField[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("app_mercago")
    .from("category_fields")
    .select("id, category_id, key, label, field_type, options, is_required, sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("fetchCategoryFields", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchListingMeta(listingId: string): Promise<{ category_id: string | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("app_mercago")
    .from("listing_meta")
    .select("category_id")
    .eq("listing_id", listingId)
    .maybeSingle();
  return data ?? null;
}

export interface ListingFieldDisplay {
  key: string;
  label: string;
  value: string;
}

export async function fetchListingFieldValuesWithLabels(listingId: string): Promise<ListingFieldDisplay[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("app_mercago")
    .from("listing_field_values")
    .select("value, category_fields(key, label, sort_order)")
    .eq("listing_id", listingId);

  if (error) {
    console.error("fetchListingFieldValuesWithLabels", error.message);
    return [];
  }

  type Row = { value: string | null; category_fields: { key: string; label: string; sort_order: number } | null };
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.category_fields && r.value)
    .sort((a, b) => (a.category_fields!.sort_order ?? 0) - (b.category_fields!.sort_order ?? 0))
    .map((r) => ({ key: r.category_fields!.key, label: r.category_fields!.label, value: r.value! }));
}

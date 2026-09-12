"use client";

import { createClient } from "@/lib/supabase/client";

export async function isFavorite(listingId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .schema("app_mercago")
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  return Boolean(data);
}

export async function toggleFavorite(listingId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión para guardar favoritos.");

  const existing = await isFavorite(listingId);
  if (existing) {
    await supabase
      .schema("app_mercago")
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);
    return false;
  }

  await supabase.schema("app_mercago").from("favorites").insert({ user_id: user.id, listing_id: listingId });
  return true;
}

export async function fetchFavoriteListingIds(): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.schema("app_mercago").from("favorites").select("listing_id").eq("user_id", user.id);
  return (data ?? []).map((r) => r.listing_id as string);
}

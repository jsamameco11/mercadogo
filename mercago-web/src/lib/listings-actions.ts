"use client";

import { createClient } from "@/lib/supabase/client";
import { ORIGIN_APP, LISTING_KIND } from "@/lib/constants";

export interface PublishListingInput {
  name: string;
  description: string;
  priceLabel: string;
  currency: "PEN" | "USD";
  categorySlug: string;
  categoryId: string;
  condition: "" | "new" | "used" | "refurbished";
  offerType: "article" | "service";
  city: string;
  department: string;
  province: string;
  district: string;
  phone: string;
  images: string[];
  fieldValues: Record<string, string>;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function publishListing(input: PublishListingInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión para publicar.");

  const visibleUntil = new Date(Date.now() + THIRTY_DAYS_MS).toISOString();

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      user_id: user.id,
      kind: LISTING_KIND,
      name: input.name,
      description: input.description,
      price_label: input.priceLabel,
      currency: input.currency,
      category: input.categorySlug,
      condition: input.condition,
      offer_type: input.offerType,
      city: input.city,
      department: input.department,
      province: input.province,
      district: input.district,
      phone: input.phone,
      image: input.images[0] ?? "",
      images: input.images,
      seller_email: user.email ?? "",
      seller_name: (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || "",
      origin_app: ORIGIN_APP,
      active: true,
      hidden: false,
      visible_until: visibleUntil,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .schema("app_mercago")
    .from("listing_meta")
    .insert({ listing_id: listing.id, category_id: input.categoryId });

  const fieldEntries = Object.entries(input.fieldValues).filter(([, v]) => v !== "");
  if (fieldEntries.length) {
    const rows = fieldEntries.map(([field_id, value]) => ({ listing_id: listing.id, field_id, value }));
    await supabase.schema("app_mercago").from("listing_field_values").insert(rows);
  }

  return listing.id as string;
}

export async function updateListing(id: string, patch: Partial<PublishListingInput>) {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.priceLabel !== undefined) update.price_label = patch.priceLabel;
  if (patch.currency !== undefined) update.currency = patch.currency;
  if (patch.condition !== undefined) update.condition = patch.condition;
  if (patch.offerType !== undefined) update.offer_type = patch.offerType;
  if (patch.city !== undefined) update.city = patch.city;
  if (patch.department !== undefined) update.department = patch.department;
  if (patch.province !== undefined) update.province = patch.province;
  if (patch.district !== undefined) update.district = patch.district;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.images !== undefined) {
    update.images = patch.images;
    update.image = patch.images[0] ?? "";
  }

  const { error } = await supabase.from("listings").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function renewListing(id: string) {
  const supabase = createClient();
  const visibleUntil = new Date(Date.now() + THIRTY_DAYS_MS).toISOString();
  const { error } = await supabase
    .from("listings")
    .update({ visible_until: visibleUntil, active: true, hidden: false })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const { data: meta } = await supabase
    .schema("app_mercago")
    .from("listing_meta")
    .select("renewed_count")
    .eq("listing_id", id)
    .maybeSingle();

  await supabase
    .schema("app_mercago")
    .from("listing_meta")
    .update({ renewed_count: (meta?.renewed_count ?? 0) + 1 })
    .eq("listing_id", id);
}

export async function setListingActive(id: string, active: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("listings").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteListing(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function uploadListingPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", "listings");
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "No se pudo subir la foto.");
  }
  return data.url;
}

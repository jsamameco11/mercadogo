import { createClient } from "@/lib/supabase/server";
import { ORIGIN_APP } from "@/lib/constants";
import type { Listing, ListingFilters } from "@/lib/types/listing";

const LISTING_COLUMNS =
  "id, user_id, kind, name, description, price_label, city, country, country_code, department, province, district, category, phone, url, image, images, active, hidden, visible_until, views, details, contacts, seller_email, seller_name, currency, origin_app, offer_type, condition, created_at, updated_at";

function priceLabelToNumber(priceLabel: string): number | null {
  const digits = priceLabel.replace(/[^0-9.]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

export async function fetchListings(filters: ListingFilters = {}): Promise<{ listings: Listing[]; count: number }> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Vitrina compartida del ecosistema: se muestran los anuncios de
  // cualquier app (folio-pdf, ingenieria, mercago, ...), no solo los
  // publicados desde aquí — así lo pidió el negocio explícitamente.
  let query = supabase
    .from("listings")
    .select(LISTING_COLUMNS, { count: "exact" })
    .eq("kind", "product")
    .eq("active", true)
    .eq("hidden", false)
    .or("visible_until.is.null,visible_until.gt." + new Date().toISOString());

  if (filters.q) {
    query = query.or(`name.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
  }
  if (filters.categorySlug) {
    query = query.eq("category", filters.categorySlug);
  }
  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }
  if (filters.condition) {
    query = query.eq("condition", filters.condition);
  }
  if (filters.offerType) {
    query = query.eq("offer_type", filters.offerType);
  }

  switch (filters.sort) {
    case "views":
      query = query.order("views", { ascending: false });
      break;
    case "price_asc":
    case "price_desc":
      // price_label es texto libre — se ordena en memoria más abajo.
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("fetchListings", error.message);
    return { listings: [], count: 0 };
  }

  let listings = (data ?? []) as Listing[];

  if (filters.minPrice != null || filters.maxPrice != null) {
    listings = listings.filter((l) => {
      const n = priceLabelToNumber(l.price_label);
      if (n == null) return false;
      if (filters.minPrice != null && n < filters.minPrice) return false;
      if (filters.maxPrice != null && n > filters.maxPrice) return false;
      return true;
    });
  }

  if (filters.sort === "price_asc" || filters.sort === "price_desc") {
    listings = [...listings].sort((a, b) => {
      const na = priceLabelToNumber(a.price_label) ?? Infinity;
      const nb = priceLabelToNumber(b.price_label) ?? Infinity;
      return filters.sort === "price_asc" ? na - nb : nb - na;
    });
  }

  return { listings, count: count ?? listings.length };
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("listings").select(LISTING_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    console.error("fetchListingById", error.message);
    return null;
  }
  return data as Listing | null;
}

export async function fetchListingsBySeller(userId: string, opts: { onlyActive?: boolean } = {}): Promise<Listing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("kind", "product")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (opts.onlyActive) {
    query = query.eq("active", true).eq("hidden", false);
  }

  const { data, error } = await query;
  if (error) {
    console.error("fetchListingsBySeller", error.message);
    return [];
  }
  return (data ?? []) as Listing[];
}

export async function fetchMyListings(): Promise<Listing[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("origin_app", ORIGIN_APP)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchMyListings", error.message);
    return [];
  }
  return (data ?? []) as Listing[];
}

export async function recordListingSignal(id: string, kind: "impression" | "dwell" | "detail" | "contact") {
  const supabase = await createClient();
  await supabase.rpc("record_listing_signal", { p_id: id, p_kind: kind, p_install: "" });
}

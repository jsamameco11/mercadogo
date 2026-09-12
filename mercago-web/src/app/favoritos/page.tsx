import { createClient } from "@/lib/supabase/server";
import { ListingGrid } from "@/components/listing/ListingGrid";
import type { Listing } from "@/lib/types/listing";

const LISTING_COLUMNS =
  "id, user_id, kind, name, description, price_label, city, country, country_code, department, province, district, category, phone, url, image, images, active, hidden, visible_until, views, details, contacts, seller_email, seller_name, currency, origin_app, offer_type, condition, created_at, updated_at";

export default async function FavoritosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let listings: Listing[] = [];
  if (user) {
    const { data: favs } = await supabase.schema("app_mercago").from("favorites").select("listing_id").eq("user_id", user.id);
    const ids = (favs ?? []).map((f) => f.listing_id as string);
    if (ids.length) {
      const { data } = await supabase.from("listings").select(LISTING_COLUMNS).in("id", ids);
      listings = (data ?? []) as Listing[];
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold">Favoritos</h1>
      <div className="mt-6">
        <ListingGrid listings={listings} emptyMessage="Todavía no guardaste ningún anuncio." />
      </div>
    </div>
  );
}

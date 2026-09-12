import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchListingsBySeller } from "@/lib/listings";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { IconUser } from "@/components/icons/line-art";

export default async function VendedorPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, first_name, profile_photo_url")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: userRow } = await supabase.from("users").select("created_at").eq("id", userId).maybeSingle();

  const listings = await fetchListingsBySeller(userId, { onlyActive: true });

  if (!profile && !userRow && listings.length === 0) notFound();

  const displayName = profile?.display_name || profile?.first_name || "Vendedor";
  const memberSince = userRow?.created_at ? new Date(userRow.created_at).getFullYear() : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6">
        <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted">
          {profile?.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.profile_photo_url} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <IconUser className="h-8 w-8" />
          )}
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold">{displayName}</h1>
          <p className="text-sm text-muted-foreground">
            {memberSince ? `En MercaGo desde ${memberSince} · ` : ""}
            {listings.length} publicación(es) activa(s)
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ListingGrid listings={listings} emptyMessage="Este vendedor no tiene publicaciones activas." />
      </div>
    </div>
  );
}

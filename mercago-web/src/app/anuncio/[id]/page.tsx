import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchListingById } from "@/lib/listings";
import { fetchListingFieldValuesWithLabels, fetchListingMeta } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";
import { ListingGallery } from "@/components/listing/ListingGallery";
import { PriceTag } from "@/components/listing/PriceTag";
import { ContactSellerButton } from "@/components/messaging/ContactSellerButton";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { ListingViewTracker } from "@/components/listing/ListingViewTracker";
import { FeatureClickTracker } from "@/components/listing/FeatureClickTracker";
import { ReportButton } from "@/components/listing/ReportButton";
import { IconLocation, IconShare, IconUser } from "@/components/icons/line-art";

const CONDITION_LABELS: Record<string, string> = { new: "Nuevo", used: "Usado", refurbished: "Reacondicionado" };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListingById(id);
  if (!listing) return { title: "Anuncio no encontrado" };
  return {
    title: listing.name,
    description: listing.description?.slice(0, 160) || listing.name,
    openGraph: { images: listing.image ? [listing.image] : [] },
  };
}

export default async function AnuncioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await fetchListingById(id);
  if (!listing || listing.kind !== "product") notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [fields, meta] = await Promise.all([fetchListingFieldValuesWithLabels(id), fetchListingMeta(id)]);
  const isOwner = user?.id === listing.user_id;
  const isVisible = listing.active && !listing.hidden && (!listing.visible_until || new Date(listing.visible_until) > new Date());

  if (!isVisible && !isOwner) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ListingViewTracker listingId={id} categoryId={meta?.category_id ?? undefined} />

      {isOwner && !isVisible && (
        <div className="mb-4 rounded-2xl bg-warning/10 p-4 text-sm text-warning">
          Este anuncio está vencido u oculto. Solo tú puedes verlo.{" "}
          <Link href="/mis-anuncios" className="underline">Renovarlo desde Mis anuncios</Link>.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <ListingGallery images={listing.images?.length ? listing.images : [listing.image]} name={listing.name} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{listing.category}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">{listing.name}</h1>
          <PriceTag priceLabel={listing.price_label} currency={listing.currency} className="mt-2 text-3xl" />

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconLocation className="h-4 w-4" /> {listing.city}{listing.district ? `, ${listing.district}` : ""}
            </span>
            {listing.condition && (
              <FeatureClickTracker listingId={id} featureKey="condition" featureValue={listing.condition} className="rounded-full border border-border px-2.5 py-1 text-xs hover:border-accent">
                {CONDITION_LABELS[listing.condition] ?? listing.condition}
              </FeatureClickTracker>
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <div className="flex-1">
              <ContactSellerButton listingId={id} isOwner={isOwner} />
            </div>
            <FavoriteButton listingId={id} className="static flex" />
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted" title="Compartir">
              <IconShare className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vendedor</p>
            <Link href={`/vendedor/${listing.user_id}`} className="mt-2 flex items-center gap-3 hover:opacity-80">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"><IconUser className="h-5 w-5" /></span>
              <span>
                <span className="block text-sm font-medium">{listing.seller_name || "Vendedor"}</span>
                <span className="block text-xs text-muted-foreground">Ver perfil y otros anuncios</span>
              </span>
            </Link>
          </div>

          {fields.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Características</p>
              <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
                {fields.map((f) => (
                  <FeatureClickTracker key={f.key} listingId={id} featureKey={f.key} featureValue={f.value} className="rounded-xl border border-border p-3 text-left hover:border-accent">
                    <dt className="text-xs text-muted-foreground">{f.label}</dt>
                    <dd className="font-medium">{f.value}</dd>
                  </FeatureClickTracker>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descripción</p>
            <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">{listing.description || "Sin descripción."}</p>
          </div>

          <ReportButton listingId={id} />
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Listing } from "@/lib/types/listing";
import { PriceTag } from "@/components/listing/PriceTag";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { IconLocation } from "@/components/icons/line-art";

const CONDITION_LABELS: Record<string, string> = { new: "Nuevo", used: "Usado", refurbished: "Reacondicionado" };
const CONDITION_STYLES: Record<string, string> = {
  new: "bg-primary text-primary-foreground",
  used: "bg-card/90 text-foreground",
  refurbished: "bg-card/90 text-foreground",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `hace ${mins < 1 ? "un momento" : mins + " min"}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return `hace ${Math.floor(days / 30)} mes(es)`;
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/anuncio/${listing.id}`}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {listing.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image}
            alt={listing.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Sin foto</div>
        )}
        <FavoriteButton listingId={listing.id} className="absolute right-2 top-2" />
        {listing.condition && CONDITION_LABELS[listing.condition] && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur ${CONDITION_STYLES[listing.condition]}`}
          >
            {CONDITION_LABELS[listing.condition]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <PriceTag priceLabel={listing.price_label} currency={listing.currency} className="text-base" />
        <p className="line-clamp-2 text-sm text-foreground/90">{listing.name}</p>
        {listing.category && (
          <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">{listing.category}</p>
        )}
        <div className="mt-auto flex items-center gap-1 pt-1 text-xs text-muted-foreground">
          <IconLocation className="h-3.5 w-3.5" />
          <span className="truncate">{listing.city || listing.district}</span>
          <span className="ml-auto shrink-0">{timeAgo(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

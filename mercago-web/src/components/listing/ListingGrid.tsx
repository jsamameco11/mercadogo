import type { Listing } from "@/lib/types/listing";
import { ListingCard } from "@/components/listing/ListingCard";

export function ListingGrid({ listings, emptyMessage = "No hay anuncios todavía." }: { listings: Listing[]; emptyMessage?: string }) {
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

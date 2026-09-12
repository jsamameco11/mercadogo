import Link from "next/link";
import { fetchMyListings } from "@/lib/listings";
import { MyListingCard } from "@/components/listing/MyListingCard";
import { IconPlus } from "@/components/icons/line-art";

export default async function MisAnunciosPage() {
  const listings = await fetchMyListings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Mis anuncios</h1>
        <Link href="/publicar" className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
          <IconPlus className="h-4 w-4" /> Publicar
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Todavía no has publicado ningún producto.
          </div>
        ) : (
          listings.map((l) => <MyListingCard key={l.id} listing={l} />)
        )}
      </div>
    </div>
  );
}

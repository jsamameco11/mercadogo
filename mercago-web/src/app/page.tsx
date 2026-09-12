import Link from "next/link";
import { fetchCategories } from "@/lib/categories";
import { fetchListings } from "@/lib/listings";
import { ListingGrid } from "@/components/listing/ListingGrid";

export default async function HomePage() {
  const [categories, recent] = await Promise.all([
    fetchCategories(),
    fetchListings({ sort: "recent", pageSize: 60 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      {categories.length > 0 && (
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categoria/${c.slug}`}
              className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium whitespace-nowrap hover:border-accent hover:text-accent"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="font-display text-base font-semibold">Anuncios destacados</h1>
        <Link href="/buscar" className="text-xs font-medium text-accent hover:underline">
          Ver todo
        </Link>
      </div>

      <ListingGrid listings={recent.listings} emptyMessage="Todavía no hay anuncios publicados. ¡Sé el primero!" />
    </div>
  );
}

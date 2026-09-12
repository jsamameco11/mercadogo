import { fetchCategories } from "@/lib/categories";
import { fetchListings } from "@/lib/listings";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { ListingFilters } from "@/components/listing/ListingFilters";
import type { ListingFilters as Filters } from "@/lib/types/listing";

type SearchParams = { [key: string]: string | undefined };

export default async function BuscarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const categories = await fetchCategories();

  const filters: Filters = {
    q: sp.q || undefined,
    categorySlug: sp.categoria || undefined,
    city: sp.ciudad || undefined,
    condition: (sp.condicion as Filters["condition"]) || undefined,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    sort: (sp.orden as Filters["sort"]) || "recent",
    page: sp.page ? Number(sp.page) : 1,
  };

  const { listings, count } = await fetchListings(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-xl font-semibold">
        {filters.q ? `Resultados para "${filters.q}"` : "Explorar productos"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{count} anuncio(s) encontrado(s)</p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <ListingFilters categories={categories} />
        <div className="flex-1">
          <ListingGrid listings={listings} emptyMessage="No encontramos anuncios con esos filtros." />
        </div>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { fetchCategories, fetchCategoryBySlug } from "@/lib/categories";
import { fetchListings } from "@/lib/listings";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { ListingFilters } from "@/components/listing/ListingFilters";

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([fetchCategoryBySlug(slug), fetchCategories()]);
  if (!category) notFound();

  const { listings, count } = await fetchListings({ categorySlug: slug, sort: "recent" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-xl font-semibold">{category.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{count} anuncio(s) en esta categoría</p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <ListingFilters categories={categories} />
        <div className="flex-1">
          <ListingGrid listings={listings} emptyMessage="Todavía no hay anuncios en esta categoría." />
        </div>
      </div>
    </div>
  );
}

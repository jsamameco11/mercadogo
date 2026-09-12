import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { IconPlus } from "@/components/icons/line-art";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .schema("app_mercago")
    .from("categories")
    .select("id, name, slug, is_active, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Administra las categorías y sus campos dinámicos."
        action={
          <Link href="/categories/nueva" className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
            <IconPlus className="h-4 w-4" /> Nueva categoría
          </Link>
        }
      />

      <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {(categories ?? []).map((c) => (
          <Link key={c.id} href={`/categories/${c.id}`} className="rounded-2xl border border-border bg-card p-4 hover:border-accent">
            <div className="flex items-center justify-between">
              <p className="font-medium">{c.name}</p>
              {!c.is_active && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Inactiva</span>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">/{c.slug}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

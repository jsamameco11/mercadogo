import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ListingModerationActions } from "@/components/admin/ListingModerationActions";
import { PriceTagAdmin } from "@/components/admin/PriceTagAdmin";

type SearchParams = { estado?: string };

export default async function ListingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { estado } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("id, name, price_label, currency, city, active, hidden, visible_until, views, contacts, seller_name, created_at")
    .eq("origin_app", "mercago")
    .order("created_at", { ascending: false })
    .limit(100);

  if (estado === "activos") query = query.eq("active", true).eq("hidden", false);
  if (estado === "ocultos") query = query.eq("hidden", true);
  if (estado === "pausados") query = query.eq("active", false);

  const { data: listings } = await query;

  function statusOf(l: { active: boolean; hidden: boolean; visible_until: string | null }) {
    if (l.hidden) return "hidden";
    if (!l.active) return "paused";
    if (l.visible_until && new Date(l.visible_until) < new Date()) return "expired";
    return "active";
  }

  return (
    <div>
      <PageHeader title="Anuncios" description="Modera las publicaciones del marketplace." />

      <div className="flex gap-2 px-6 pt-4 text-sm">
        {[
          { key: "", label: "Todos" },
          { key: "activos", label: "Activos" },
          { key: "ocultos", label: "Ocultos" },
          { key: "pausados", label: "Pausados" },
        ].map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/listings?estado=${f.key}` : "/listings"}
            className={`rounded-full px-3 py-1.5 ${estado === f.key || (!estado && !f.key) ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto p-6">
        <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3">Producto</th>
              <th className="px-3">Vendedor</th>
              <th className="px-3">Precio</th>
              <th className="px-3">Estado</th>
              <th className="px-3">Vistas / contactos</th>
              <th className="px-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).map((l) => (
              <tr key={l.id} className="rounded-2xl bg-card">
                <td className="rounded-l-2xl px-3 py-3">
                  <span className="line-clamp-1 block font-medium">{l.name}</span>
                  <span className="block text-xs text-muted-foreground">{l.city}</span>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{l.seller_name}</td>
                <td className="px-3 py-3"><PriceTagAdmin priceLabel={l.price_label} currency={l.currency} /></td>
                <td className="px-3 py-3"><StatusBadge status={statusOf(l)} /></td>
                <td className="px-3 py-3 text-muted-foreground">{l.views} / {l.contacts}</td>
                <td className="rounded-r-2xl px-3 py-3">
                  <ListingModerationActions id={l.id} hidden={l.hidden} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!listings || listings.length === 0) && (
          <p className="py-12 text-center text-sm text-muted-foreground">No hay anuncios con este filtro.</p>
        )}
      </div>
    </div>
  );
}

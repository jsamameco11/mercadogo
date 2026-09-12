import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ReportActions } from "@/components/admin/ReportActions";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .schema("app_mercago")
    .from("reports")
    .select("id, listing_id, reason, details, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const listingIds = [...new Set((reports ?? []).map((r) => r.listing_id))];
  const { data: listings } = listingIds.length
    ? await supabase.from("listings").select("id, name").in("id", listingIds)
    : { data: [] as { id: string; name: string }[] };
  const nameById = new Map((listings ?? []).map((l) => [l.id, l.name]));

  return (
    <div>
      <PageHeader title="Reportes" description="Cola de moderación de publicaciones reportadas por usuarios." />
      <div className="space-y-3 p-6">
        {(reports ?? []).map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{nameById.get(r.listing_id) ?? "Anuncio eliminado"}</p>
                <p className="text-sm text-muted-foreground">{r.reason}{r.details ? ` — ${r.details}` : ""}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-3">
              <ReportActions id={r.id} listingId={r.listing_id} />
            </div>
          </div>
        ))}
        {(!reports || reports.length === 0) && <p className="py-12 text-center text-sm text-muted-foreground">No hay reportes.</p>}
      </div>
    </div>
  );
}

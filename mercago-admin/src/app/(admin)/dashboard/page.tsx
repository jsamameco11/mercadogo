import { createClient } from "@/lib/supabase/server";
import { getMonetizationEnabled } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const monetization = await getMonetizationEnabled();

  const [{ count: activeCount }, { count: totalCount }, { count: reportsCount }, { count: ordersPendingCount }] = await Promise.all([
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("origin_app", "mercago").eq("active", true).eq("hidden", false),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("origin_app", "mercago"),
    supabase.schema("app_mercago").from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.schema("app_mercago").from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <div>
      <PageHeader title="Dashboard" description="Resumen general del marketplace." />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Anuncios activos" value={activeCount ?? 0} />
        <StatCard label="Anuncios totales" value={totalCount ?? 0} />
        <StatCard label="Reportes pendientes" value={reportsCount ?? 0} />
        <StatCard
          label="Pagos pendientes"
          value={monetization ? ordersPendingCount ?? 0 : "—"}
          hint={monetization ? undefined : "Monetización desactivada"}
        />
      </div>

      {!monetization && (
        <div className="mx-6 mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          La publicación es gratuita: la monetización está desactivada. Actívala desde <strong>Configuración</strong> cuando quieras cobrar por publicar.
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getMonetizationEnabled } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderActions } from "@/components/admin/OrderActions";

export default async function PaymentsPage() {
  const monetization = await getMonetizationEnabled();
  const supabase = await createClient();
  const { data: orders } = await supabase
    .schema("app_mercago")
    .from("orders")
    .select("id, user_id, plan_id, status, amount, currency, payment_reference, created_at, plans(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader title="Pagos y activaciones" description="Confirma o rechaza manualmente los pagos por publicación." />

      {!monetization && (
        <div className="mx-6 mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          La monetización está desactivada — los usuarios no ven planes ni generan órdenes de pago. Actívala en <strong>Configuración</strong>.
        </div>
      )}

      <div className="space-y-3 p-6">
        {(orders ?? []).map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <div>
              <p className="font-medium">{(o.plans as unknown as { name: string } | null)?.name ?? "Plan"} — {o.currency} {o.amount}</p>
              <p className="text-xs text-muted-foreground">Usuario {o.user_id.slice(0, 8)}… · {new Date(o.created_at).toLocaleString()}</p>
              {o.payment_reference && <p className="text-xs text-muted-foreground">Ref: {o.payment_reference}</p>}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={o.status} />
              {o.status === "pending" && <OrderActions id={o.id} />}
            </div>
          </div>
        ))}
        {(!orders || orders.length === 0) && <p className="py-12 text-center text-sm text-muted-foreground">No hay órdenes de pago todavía.</p>}
      </div>
    </div>
  );
}

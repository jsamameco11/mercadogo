import { createClient } from "@/lib/supabase/server";
import { getMonetizationEnabled } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { PlanRow } from "@/components/admin/PlanRow";

export default async function PlansPage() {
  const supabase = await createClient();
  const monetization = await getMonetizationEnabled();
  const { data: plans } = await supabase
    .schema("app_mercago")
    .from("plans")
    .select("id, code, name, price, currency, listing_slots, duration_days, is_active")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Planes y precios"
        description={monetization ? "Estos planes están activos: los usuarios deben pagar para publicar." : "La monetización está desactivada — estos precios quedan listos para cuando la actives."}
      />
      <div className="space-y-3 p-6">
        {(plans ?? []).map((p) => (
          <PlanRow key={p.id} plan={p} />
        ))}
      </div>
    </div>
  );
}

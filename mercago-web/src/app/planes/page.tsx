import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMonetizationEnabled } from "@/lib/settings";
import { IconCheck } from "@/components/icons/line-art";

interface Plan {
  id: string;
  code: string;
  name: string;
  price: number;
  currency: string;
  listing_slots: number;
  duration_days: number;
}

export default async function PlanesPage() {
  const monetization = await getMonetizationEnabled();
  const supabase = await createClient();
  const { data: plans } = await supabase
    .schema("app_mercago")
    .from("plans")
    .select("id, code, name, price, currency, listing_slots, duration_days")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold">Planes de publicación</h1>

      {!monetization ? (
        <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-border bg-card p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Promoción de lanzamiento</p>
          <p className="mt-3 font-display text-xl font-semibold">Publicar es 100% gratis por ahora</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No hay límite de publicaciones ni costo por anunciar. Aprovecha para publicar tus productos hoy mismo.
          </p>
          <Link href="/publicar" className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90">
            Publicar producto
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {(plans as Plan[] | null)?.map((plan, i) => (
            <div key={plan.id} className={`rounded-3xl border p-8 text-left ${i === 1 ? "border-accent shadow-lg" : "border-border"} bg-card`}>
              {i === 1 && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">Más elegido</p>}
              <p className="font-display text-lg font-semibold">{plan.name}</p>
              <p className="mt-2 font-display text-3xl font-bold">
                {plan.currency === "PEN" ? "S/ " : "$"}
                {plan.price}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><IconCheck className="h-4 w-4 text-success" /> {plan.listing_slots} publicación(es)</li>
                <li className="flex items-center gap-2"><IconCheck className="h-4 w-4 text-success" /> {plan.duration_days} días de vigencia</li>
                <li className="flex items-center gap-2"><IconCheck className="h-4 w-4 text-success" /> Renovación mensual</li>
              </ul>
              <Link href="/publicar" className="mt-6 block rounded-full bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground hover:opacity-90">
                Elegir plan
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

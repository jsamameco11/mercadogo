"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Plan {
  id: string;
  code: string;
  name: string;
  price: number;
  currency: string;
  listing_slots: number;
  duration_days: number;
  is_active: boolean;
}

export function PlanRow({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(plan.price);
  const [slots, setSlots] = useState(plan.listing_slots);
  const [duration, setDuration] = useState(plan.duration_days);
  const [active, setActive] = useState(plan.is_active);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function save() {
    setStatus("saving");
    const supabase = createClient();
    await supabase
      .schema("app_mercago")
      .from("plans")
      .update({ name, price, listing_slots: slots, duration_days: duration, is_active: active })
      .eq("id", plan.id);
    setStatus("saved");
    router.refresh();
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-6 sm:items-center">
      <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none sm:col-span-2" />
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">S/</span>
        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
      </div>
      <input type="number" value={slots} onChange={(e) => setSlots(Number(e.target.value))} className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" title="Publicaciones incluidas" />
      <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" title="Días de vigencia" />
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Activo
        </label>
        <button onClick={save} disabled={status === "saving"} className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {status === "saving" ? "…" : status === "saved" ? "Guardado" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";

export function MonetizationToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setEnabled(value: boolean) {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .schema("app_mercago")
      .from("settings")
      .update({ value: { enabled: value }, updated_by: user?.id, updated_at: new Date().toISOString() })
      .eq("key", "monetization");
    await supabase.schema("app_mercago").from("audit_log").insert({
      actor_id: user?.id,
      action: value ? "settings.monetization_enable" : "settings.monetization_disable",
      target_type: "settings",
      target_id: "monetization",
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-base font-semibold">Cobrar por publicación</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {enabled
              ? "Activo: los usuarios deben comprar un plan para publicar. Los pagos se confirman manualmente en Pagos y activaciones."
              : "Desactivado: cualquier usuario puede publicar gratis, sin límite."}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
          {enabled ? "Activado" : "Desactivado"}
        </span>
      </div>

      <div className="mt-5">
        {enabled ? (
          <ConfirmDialog
            trigger={<button disabled={busy} className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60">Desactivar cobros</button>}
            title="¿Desactivar la monetización?"
            description="La publicación volverá a ser gratuita para todos los usuarios de inmediato."
            confirmLabel="Desactivar"
            onConfirm={() => setEnabled(false)}
          />
        ) : (
          <ConfirmDialog
            trigger={<button disabled={busy} className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60">Activar cobros</button>}
            title="¿Activar el cobro por publicación?"
            description="Los usuarios necesitarán comprar un plan (revisa precios en 'Planes y precios') para publicar nuevos anuncios."
            confirmLabel="Activar"
            onConfirm={() => setEnabled(true)}
          />
        )}
      </div>
    </div>
  );
}

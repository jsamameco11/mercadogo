"use client";

import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

async function post(id: string, action: "confirm" | "reject") {
  const res = await fetch(`/api/orders/${id}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "No se pudo procesar la orden.");
  }
}

export function OrderActions({ id }: { id: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <ConfirmDialog
        trigger={<button className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">Confirmar pago y activar plan</button>}
        title="¿Confirmar este pago?"
        description="Se activará la suscripción del usuario con los cupos del plan seleccionado."
        confirmLabel="Confirmar y activar"
        onConfirm={async () => {
          await post(id, "confirm");
          router.refresh();
        }}
      />
      <ConfirmDialog
        trigger={<button className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10">Rechazar</button>}
        title="¿Rechazar este pago?"
        confirmLabel="Rechazar"
        danger
        onConfirm={async () => {
          await post(id, "reject");
          router.refresh();
        }}
      />
    </div>
  );
}

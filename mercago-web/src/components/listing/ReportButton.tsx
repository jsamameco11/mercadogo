"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconFlag, IconClose } from "@/components/icons/line-art";

const REASONS = [
  "Producto fraudulento",
  "Producto prohibido",
  "Información falsa",
  "Precio engañoso",
  "Contenido ofensivo",
  "Spam",
  "Publicación duplicada",
  "Otro",
];

export function ReportButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    setStatus("sending");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const { error } = await supabase
      .schema("app_mercago")
      .from("reports")
      .insert({ listing_id: listingId, reporter_id: user.id, reason, details });
    setStatus(error ? "error" : "sent");
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-danger">
        <IconFlag className="h-3.5 w-3.5" /> Reportar publicación
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-sm font-semibold">Reportar publicación</p>
              <button onClick={() => setOpen(false)}><IconClose className="h-4 w-4" /></button>
            </div>

            {status === "sent" ? (
              <p className="text-sm text-success">Gracias, revisaremos esta publicación.</p>
            ) : (
              <div className="space-y-3">
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none">
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Cuéntanos más (opcional)"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
                />
                <button
                  onClick={submit}
                  disabled={status === "sending"}
                  className="w-full rounded-full bg-danger py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {status === "sending" ? "Enviando…" : "Enviar reporte"}
                </button>
                {status === "error" && <p className="text-xs text-danger">No se pudo enviar el reporte.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

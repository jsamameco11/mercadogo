"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ReportActions({ id, listingId }: { id: string; listingId: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function setStatus(status: "reviewed" | "dismissed" | "actioned") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .schema("app_mercago")
      .from("reports")
      .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`/listings`} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
        Ver anuncio
      </a>
      <button onClick={() => setStatus("dismissed")} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
        Descartar
      </button>
      <button onClick={() => setStatus("actioned")} className="rounded-full bg-danger px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
        Marcar accionado
      </button>
    </div>
  );
}

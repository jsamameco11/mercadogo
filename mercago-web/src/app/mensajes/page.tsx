"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchMyThreads } from "@/lib/messaging";
import type { ListingThread } from "@/lib/types/thread";
import { IconChat } from "@/components/icons/line-art";

export default function MensajesPage() {
  const [threads, setThreads] = useState<ListingThread[]>([]);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState<"loading" | "idle">("loading");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      const t = await fetchMyThreads();
      setThreads(t);
      setStatus("idle");
    })();
  }, []);

  if (status === "loading") {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">Cargando…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold">Mensajes</h1>

      {threads.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          <IconChat className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          Todavía no tienes conversaciones.
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {threads.map((t) => {
            const isSeller = t.seller_id === userId;
            const unread = isSeller ? t.seller_unread : t.buyer_unread;
            const otherName = isSeller ? t.buyer_name : t.seller_name;
            return (
              <Link
                key={t.id}
                href={`/mensajes/${t.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-accent"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {t.listing_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.listing_image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{otherName || "Usuario"}</p>
                    {unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground">
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{t.listing_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.last_body}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

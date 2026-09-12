"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logEvent } from "@/lib/events";

// Dispara la señal pública de detalle (record_listing_signal, ejecutable por
// anon) y, si hay sesión, un evento LISTING_VIEW en user_events.
export function ListingViewTracker({ listingId, categoryId }: { listingId: string; categoryId?: string }) {
  useEffect(() => {
    const supabase = createClient();
    void supabase.rpc("record_listing_signal", { p_id: listingId, p_kind: "detail", p_install: "" });
    void logEvent("LISTING_VIEW", { objectId: listingId, categoryId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  return null;
}

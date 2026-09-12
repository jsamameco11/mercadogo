"use client";

import { createClient } from "@/lib/supabase/client";

export type MarketplaceEventType =
  | "LISTING_VIEW"
  | "LISTING_FEATURE_CLICK"
  | "LISTING_CONTACT_CLICK"
  | "LISTING_FAVORITE_ADD"
  | "LISTING_FAVORITE_REMOVE";

// Reutiliza la tabla genérica public.user_events del ecosistema — no crea
// tablas nuevas de tracking. event_type es texto libre por diseño.
export async function logEvent(
  eventType: MarketplaceEventType,
  opts: { objectId?: string; categoryId?: string; metadata?: Record<string, unknown> } = {}
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return; // user_events.user_id es NOT NULL — solo usuarios logueados generan señales

  await supabase.from("user_events").insert({
    user_id: user.id,
    event_type: eventType,
    object_type: "listing",
    object_id: opts.objectId ?? null,
    category_id: opts.categoryId ?? null,
    metadata: opts.metadata ?? {},
    source: "mercago",
  });
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { openListingThread } from "@/lib/messaging";
import { logEvent } from "@/lib/events";
import { IconChat } from "@/components/icons/line-art";

export function ContactSellerButton({ listingId, isOwner }: { listingId: string; isOwner: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (isOwner) return null;

  async function handleClick() {
    setBusy(true);
    setError("");
    try {
      const threadId = await openListingThread(listingId);
      void logEvent("LISTING_CONTACT_CLICK", { objectId: listingId });
      router.push(`/mensajes/${threadId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("row-level") || message.toLowerCase().includes("jwt") || !message) {
        router.push(`/login?next=${encodeURIComponent(`/anuncio/${listingId}`)}`);
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        <IconChat className="h-4 w-4" /> {busy ? "Abriendo chat…" : "Contactar vendedor"}
      </button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

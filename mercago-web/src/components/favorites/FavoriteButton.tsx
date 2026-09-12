"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { logEvent } from "@/lib/events";
import { IconHeart } from "@/components/icons/line-art";

export function FavoriteButton({ listingId, className = "" }: { listingId: string; className?: string }) {
  const router = useRouter();
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    isFavorite(listingId).then(setFav);
  }, [listingId]);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const next = await toggleFavorite(listingId);
      setFav(next);
      void logEvent(next ? "LISTING_FAVORITE_ADD" : "LISTING_FAVORITE_REMOVE", { objectId: listingId });
    } catch {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      aria-label={fav ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors hover:text-accent ${className}`}
    >
      <IconHeart className={`h-4.5 w-4.5 ${fav ? "text-accent" : ""}`} filled={fav} />
    </button>
  );
}

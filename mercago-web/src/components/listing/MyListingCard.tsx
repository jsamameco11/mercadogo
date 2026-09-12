"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Listing } from "@/lib/types/listing";
import { PriceTag } from "@/components/listing/PriceTag";
import { deleteListing, renewListing, setListingActive } from "@/lib/listings-actions";

function statusOf(listing: Listing): { label: string; color: string } {
  if (listing.hidden) return { label: "Oculto por moderación", color: "bg-muted text-muted-foreground" };
  if (!listing.active) return { label: "Pausado", color: "bg-muted text-muted-foreground" };
  if (listing.visible_until && new Date(listing.visible_until) < new Date()) {
    return { label: "Vencido", color: "bg-danger/10 text-danger" };
  }
  if (listing.visible_until) {
    const daysLeft = Math.ceil((new Date(listing.visible_until).getTime() - Date.now()) / 86400000);
    if (daysLeft <= 5) return { label: `Vence en ${daysLeft} día(s)`, color: "bg-warning/10 text-warning" };
  }
  return { label: "Activo", color: "bg-success/10 text-success" };
}

export function MyListingCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const status = statusOf(listing);
  const expired = Boolean(listing.visible_until && new Date(listing.visible_until) < new Date());

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-4">
      <Link href={`/anuncio/${listing.id}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        {listing.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.image} alt={listing.name} className="h-full w-full object-cover" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/anuncio/${listing.id}`} className="line-clamp-1 text-sm font-medium hover:text-accent">{listing.name}</Link>
            <PriceTag priceLabel={listing.price_label} currency={listing.currency} className="text-sm" />
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.color}`}>{status.label}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{listing.views} vistas</span>
          <span>{listing.details} detalles</span>
          <span>{listing.contacts} contactos</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/publicar/${listing.id}/editar`} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
            Editar
          </Link>
          {expired || !listing.active ? (
            <button disabled={busy} onClick={() => run(() => renewListing(listing.id))} className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60">
              Renovar 30 días
            </button>
          ) : (
            <button disabled={busy} onClick={() => run(() => setListingActive(listing.id, false))} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60">
              Pausar
            </button>
          )}
          {!listing.active && !expired && (
            <button disabled={busy} onClick={() => run(() => setListingActive(listing.id, true))} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60">
              Reactivar
            </button>
          )}
          <button
            disabled={busy}
            onClick={() => {
              if (confirm("¿Eliminar este anuncio? Esta acción no se puede deshacer.")) run(() => deleteListing(listing.id));
            }}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 disabled:opacity-60"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

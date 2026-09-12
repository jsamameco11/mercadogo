"use client";

import { logEvent } from "@/lib/events";

// Envuelve cualquier característica del anuncio (marca, condición, campo
// dinámico, etc.) para registrar en qué features hace clic el usuario —
// insumo para un futuro motor de recomendación (Fase 3).
export function FeatureClickTracker({
  listingId,
  featureKey,
  featureValue,
  children,
  className = "",
}: {
  listingId: string;
  featureKey: string;
  featureValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        void logEvent("LISTING_FEATURE_CLICK", {
          objectId: listingId,
          metadata: { feature_key: featureKey, feature_value: featureValue },
        })
      }
      className={className}
    >
      {children}
    </button>
  );
}

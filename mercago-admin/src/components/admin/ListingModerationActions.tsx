"use client";

import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

async function moderate(id: string, action: "hide" | "unhide" | "delete") {
  const res = await fetch(`/api/listings/${id}/moderate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "No se pudo completar la acción.");
  }
}

export function ListingModerationActions({ id, hidden }: { id: string; hidden: boolean }) {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      {hidden ? (
        <ConfirmDialog
          trigger={<button className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">Mostrar</button>}
          title="¿Mostrar este anuncio?"
          description="Volverá a aparecer en las búsquedas públicas si sigue activo y vigente."
          onConfirm={async () => {
            await moderate(id, "unhide");
            router.refresh();
          }}
        />
      ) : (
        <ConfirmDialog
          trigger={<button className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">Ocultar</button>}
          title="¿Ocultar este anuncio?"
          description="Dejará de aparecer en búsquedas públicas, pero el vendedor seguirá viéndolo en 'Mis anuncios'."
          onConfirm={async () => {
            await moderate(id, "hide");
            router.refresh();
          }}
        />
      )}
      <ConfirmDialog
        trigger={<button className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10">Eliminar</button>}
        title="¿Eliminar este anuncio permanentemente?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
        onConfirm={async () => {
          await moderate(id, "delete");
          router.refresh();
        }}
      />
    </div>
  );
}

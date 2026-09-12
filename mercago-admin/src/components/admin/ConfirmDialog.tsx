"use client";

import { useState } from "react";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  danger = false,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !busy && setOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-base font-semibold">{title}</p>
            {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
            <div className="mt-6 flex gap-2">
              <button onClick={() => setOpen(false)} disabled={busy} className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium hover:bg-muted">
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setBusy(true);
                  await onConfirm();
                  setBusy(false);
                  setOpen(false);
                }}
                disabled={busy}
                className={`flex-1 rounded-full py-2.5 text-sm font-medium text-white disabled:opacity-60 ${danger ? "bg-danger" : "bg-primary text-primary-foreground"}`}
              >
                {busy ? "Procesando…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

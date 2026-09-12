"use client";

import { useRef, useState } from "react";
import { uploadListingPhoto } from "@/lib/listings-actions";
import { IconCamera, IconClose } from "@/components/icons/line-art";

export function PhotoUploader({ images, onChange, max = 8 }: { images: string[]; onChange: (urls: string[]) => void; max?: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setError("");
    setBusy(true);
    try {
      const remaining = max - images.length;
      const list = Array.from(files).slice(0, Math.max(remaining, 0));
      const uploaded: string[] = [];
      for (const file of list) {
        if (!file.type.startsWith("image/")) continue;
        const url = await uploadListingPhoto(file);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Portada</span>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <IconClose className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-60"
          >
            <IconCamera className="h-6 w-6" />
            <span className="text-xs">{busy ? "Subiendo…" : "Agregar foto"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <p className="mt-2 text-xs text-muted-foreground">Hasta {max} fotos. La primera será la portada.</p>
    </div>
  );
}

"use client";

import { useState } from "react";

export function ListingGallery({ images, name }: { images: string[]; name: string }) {
  const photos = images.length ? images : [""];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted">
        {photos[active] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[active]} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Sin fotos</div>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
          {photos.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${i === active ? "border-accent" : "border-transparent"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

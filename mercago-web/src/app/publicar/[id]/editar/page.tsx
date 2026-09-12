"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateListing } from "@/lib/listings-actions";
import { PhotoUploader } from "@/components/publish/PhotoUploader";
import type { Listing } from "@/lib/types/listing";

export default function EditarAnuncioPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "error" | "forbidden">("loading");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?next=/publicar/${params.id}/editar`);
        return;
      }
      const { data } = await supabase.from("listings").select("*").eq("id", params.id).maybeSingle();
      if (!data || data.user_id !== user.id) {
        setStatus("forbidden");
        return;
      }
      const l = data as Listing;
      setListing(l);
      setName(l.name);
      setDescription(l.description);
      setPriceLabel(l.price_label);
      setPhone(l.phone);
      setCity(l.city);
      setImages(l.images?.length ? l.images : l.image ? [l.image] : []);
      setStatus("idle");
    })();
  }, [params.id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      await updateListing(params.id, { name, description, priceLabel, phone, city, images });
      router.push(`/anuncio/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setStatus("error");
    }
  }

  if (status === "loading") return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">Cargando…</div>;
  if (status === "forbidden") return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-danger">No puedes editar este anuncio.</div>;
  if (!listing) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold">Editar anuncio</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Título</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Descripción</label>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} placeholder="Precio" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
          </div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-4 text-sm font-semibold">Fotos</p>
          <PhotoUploader images={images} onChange={setImages} />
        </section>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={status === "saving"} className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60">
          {status === "saving" ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

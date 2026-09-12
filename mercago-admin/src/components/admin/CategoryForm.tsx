"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({
  initial,
}: {
  initial?: { id: string; name: string; slug: string; icon: string | null; sort_order: number; is_active: boolean };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    const supabase = createClient();
    const payload = { name, slug, icon: icon || null, sort_order: sortOrder, is_active: isActive };

    const { error: err, data } = initial
      ? await supabase.schema("app_mercago").from("categories").update(payload).eq("id", initial.id).select("id").single()
      : await supabase.schema("app_mercago").from("categories").insert(payload).select("id").single();

    if (err) {
      setError(err.message);
      setStatus("error");
      return;
    }
    router.push(`/categories/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nombre</label>
        <input
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Slug</label>
        <input
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ícono (texto libre)</label>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Orden</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Categoría activa (visible en la tienda)
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button type="submit" disabled={status === "saving"} className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
        {status === "saving" ? "Guardando…" : initial ? "Guardar cambios" : "Crear categoría"}
      </button>
    </form>
  );
}

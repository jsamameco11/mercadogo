"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/lib/types/category";
import { IconClose } from "@/components/icons/line-art";

export function ListingFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState(searchParams.get("categoria") ?? "");
  const [city, setCity] = useState(searchParams.get("ciudad") ?? "");
  const [condition, setCondition] = useState(searchParams.get("condicion") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");
  const [sort, setSort] = useState(searchParams.get("orden") ?? "recent");

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    const set = (key: string, value: string) => (value ? params.set(key, value) : params.delete(key));
    set("categoria", category);
    set("ciudad", city);
    set("condicion", condition);
    set("min", minPrice);
    set("max", maxPrice);
    set("orden", sort);
    params.delete("page");
    router.push(`/buscar?${params.toString()}`);
    setOpen(false);
  }

  function clearAll() {
    setCategory("");
    setCity("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
    setSort("recent");
    router.push(`/buscar?q=${searchParams.get("q") ?? ""}`);
    setOpen(false);
  }

  const fields = (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Categoría</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ciudad</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej. Chiclayo" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Condición</label>
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
          <option value="">Cualquiera</option>
          <option value="new">Nuevo</option>
          <option value="used">Usado</option>
          <option value="refurbished">Reacondicionado</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Precio mín.</label>
          <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} inputMode="numeric" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Precio máx.</label>
          <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} inputMode="numeric" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ordenar por</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
          <option value="recent">Más recientes</option>
          <option value="price_asc">Menor precio</option>
          <option value="price_desc">Mayor precio</option>
          <option value="views">Más vistos</option>
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={clearAll} className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium hover:bg-muted">
          Limpiar
        </button>
        <button onClick={apply} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          Aplicar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-2.5 text-sm font-medium lg:hidden"
      >
        Filtros y orden
      </button>

      <aside className="hidden w-64 shrink-0 rounded-2xl border border-border bg-card p-5 lg:block">
        <p className="mb-4 font-display text-sm font-semibold">Filtros</p>
        {fields}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-sm font-semibold">Filtros</p>
              <button onClick={() => setOpen(false)}><IconClose className="h-5 w-5" /></button>
            </div>
            {fields}
          </div>
        </div>
      )}
    </>
  );
}

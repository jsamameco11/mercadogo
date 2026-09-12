"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchCategoriesClient, fetchCategoryFieldsClient } from "@/lib/categories-client";
import { publishListing } from "@/lib/listings-actions";
import { PhotoUploader } from "@/components/publish/PhotoUploader";
import { DynamicFieldsForm } from "@/components/publish/DynamicFieldsForm";
import type { Category, CategoryField } from "@/lib/types/category";

export default function PublicarPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [fields, setFields] = useState<CategoryField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [currency, setCurrency] = useState<"PEN" | "USD">("PEN");
  const [condition, setCondition] = useState<"" | "new" | "used" | "refurbished">("used");
  const [offerType, setOfferType] = useState<"article" | "service">("article");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [status, setStatus] = useState<"idle" | "checking" | "sending" | "error">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login?next=/publicar");
        return;
      }
      setStatus("idle");
    });
    fetchCategoriesClient().then(setCategories);
  }, [router]);

  useEffect(() => {
    if (!categoryId) {
      setFields([]);
      return;
    }
    fetchCategoryFieldsClient(categoryId).then(setFields);
  }, [categoryId]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory) {
      setError("Elige una categoría.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const id = await publishListing({
        name,
        description,
        priceLabel,
        currency,
        categorySlug: selectedCategory.slug,
        categoryId: selectedCategory.id,
        condition,
        offerType,
        city,
        department,
        province,
        district,
        phone,
        images,
        fieldValues: Object.fromEntries(Object.entries(fieldValues).map(([k, v]) => [k, v])),
      });
      router.push(`/anuncio/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar el anuncio.");
      setStatus("error");
    }
  }

  if (status === "checking") {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">Cargando…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold">Publicar producto</h1>
      <p className="mt-1 text-sm text-muted-foreground">Publicar es gratis. Tu anuncio estará visible por 30 días.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-4 text-sm font-semibold">1. Categoría</p>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </section>

        {selectedCategory && (
          <>
            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-4 text-sm font-semibold">2. Datos del producto</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Título *</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Descripción</label>
                  <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Precio</label>
                    <input value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} placeholder="Ej. 250 o Consultar" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Moneda</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value as "PEN" | "USD")} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
                      <option value="PEN">Soles (S/)</option>
                      <option value="USD">Dólares ($)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tipo</label>
                    <select value={offerType} onChange={(e) => setOfferType(e.target.value as "article" | "service")} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
                      <option value="article">Artículo</option>
                      <option value="service">Servicio</option>
                    </select>
                  </div>
                  {offerType === "article" && (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Condición</label>
                      <select value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
                        <option value="new">Nuevo</option>
                        <option value="used">Usado</option>
                        <option value="refurbished">Reacondicionado</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {fields.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-5">
                <p className="mb-4 text-sm font-semibold">3. Detalles de {selectedCategory.name}</p>
                <DynamicFieldsForm
                  fields={fields}
                  values={fieldValues}
                  onChange={(id, value) => setFieldValues((prev) => ({ ...prev, [id]: value }))}
                />
              </section>
            )}

            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-4 text-sm font-semibold">4. Ubicación y contacto</p>
              <div className="grid grid-cols-2 gap-3">
                <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Departamento" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
                <input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Provincia" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
                <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Distrito" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
                <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad *" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
              </div>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono (opcional, se muestra a compradores)" className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-4 text-sm font-semibold">5. Fotos</p>
              <PhotoUploader images={images} onChange={setImages} />
            </section>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
            >
              {status === "sending" ? "Publicando…" : "Publicar producto"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

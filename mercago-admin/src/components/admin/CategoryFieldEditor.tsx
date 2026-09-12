"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconPlus, IconTrash } from "@/components/icons/line-art";
import type { CategoryField, CategoryFieldType } from "@/lib/types/category";

export function CategoryFieldEditor({ categoryId, fields }: { categoryId: string; fields: CategoryField[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<CategoryFieldType>("text");
  const [options, setOptions] = useState("");
  const [required, setRequired] = useState(false);
  const [error, setError] = useState("");

  async function addField(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.schema("app_mercago").from("category_fields").insert({
      category_id: categoryId,
      key,
      label,
      field_type: fieldType,
      options: fieldType === "select" ? options.split(",").map((o) => o.trim()).filter(Boolean) : [],
      is_required: required,
      sort_order: fields.length,
    });
    if (err) {
      setError(err.message);
      return;
    }
    setKey("");
    setLabel("");
    setOptions("");
    setRequired(false);
    setAdding(false);
    router.refresh();
  }

  async function removeField(id: string) {
    const supabase = createClient();
    await supabase.schema("app_mercago").from("category_fields").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold">Campos dinámicos</p>
        <button onClick={() => setAdding((v) => !v)} className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
          <IconPlus className="h-3.5 w-3.5" /> Agregar campo
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {fields.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
            <span>
              {f.label} <span className="text-xs text-muted-foreground">({f.key} · {f.field_type}{f.is_required ? " · requerido" : ""})</span>
            </span>
            <button onClick={() => removeField(f.id)} className="text-danger hover:opacity-70"><IconTrash /></button>
          </div>
        ))}
        {fields.length === 0 && <p className="text-sm text-muted-foreground">Sin campos todavía.</p>}
      </div>

      {adding && (
        <form onSubmit={addField} className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Clave (ej. marca)" value={key} onChange={(e) => setKey(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
            <input required placeholder="Etiqueta (ej. Marca)" value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
          </div>
          <select value={fieldType} onChange={(e) => setFieldType(e.target.value as CategoryFieldType)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none">
            <option value="text">Texto</option>
            <option value="number">Número</option>
            <option value="select">Selección (lista)</option>
            <option value="boolean">Sí / No</option>
          </select>
          {fieldType === "select" && (
            <input placeholder="Opciones separadas por coma" value={options} onChange={(e) => setOptions(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} /> Obligatorio
          </label>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Agregar
          </button>
        </form>
      )}
    </div>
  );
}

"use client";

import type { CategoryField } from "@/lib/types/category";

export function DynamicFieldsForm({
  fields,
  values,
  onChange,
}: {
  fields: CategoryField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}) {
  if (!fields.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {field.label} {field.is_required && <span className="text-danger">*</span>}
          </label>
          {field.field_type === "select" ? (
            <select
              required={field.is_required}
              value={values[field.id] ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
            >
              <option value="">Selecciona...</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : field.field_type === "boolean" ? (
            <select
              required={field.is_required}
              value={values[field.id] ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
            >
              <option value="">Selecciona...</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </select>
          ) : (
            <input
              type={field.field_type === "number" ? "number" : "text"}
              required={field.is_required}
              value={values[field.id] ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          )}
        </div>
      ))}
    </div>
  );
}

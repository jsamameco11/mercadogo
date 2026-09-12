import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { CategoryFieldEditor } from "@/components/admin/CategoryFieldEditor";

export default async function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase.schema("app_mercago").from("categories").select("*").eq("id", id).maybeSingle();
  if (!category) notFound();

  const { data: fields } = await supabase
    .schema("app_mercago")
    .from("category_fields")
    .select("id, category_id, key, label, field_type, options, is_required, sort_order")
    .eq("category_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <PageHeader title={category.name} description="Editar categoría y sus campos dinámicos." />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <CategoryForm initial={category} />
        <CategoryFieldEditor categoryId={id} fields={fields ?? []} />
      </div>
    </div>
  );
}

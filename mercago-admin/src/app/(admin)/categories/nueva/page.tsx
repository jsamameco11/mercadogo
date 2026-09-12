import { PageHeader } from "@/components/admin/PageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NuevaCategoriaPage() {
  return (
    <div>
      <PageHeader title="Nueva categoría" />
      <div className="p-6">
        <CategoryForm />
      </div>
    </div>
  );
}

export type CategoryFieldType = "text" | "number" | "select" | "boolean";

export interface Category {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryField {
  id: string;
  category_id: string;
  key: string;
  label: string;
  field_type: CategoryFieldType;
  options: string[];
  is_required: boolean;
  sort_order: number;
}

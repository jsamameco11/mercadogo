export type CategoryFieldType = "text" | "number" | "select" | "boolean";

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

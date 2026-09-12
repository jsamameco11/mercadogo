import { createClient } from "@/lib/supabase/server";

export type StaffRole = "superadmin" | "moderador" | "soporte_financiero";

export interface CurrentStaff {
  userId: string;
  email: string | null;
  role: StaffRole;
}

// Resuelve el rol de staff propio de MercaGo (app_mercago.staff),
// independiente de private.is_admin() del esquema maestro.
export async function getCurrentStaff(): Promise<CurrentStaff | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: staff } = await supabase
    .schema("app_mercago")
    .from("staff")
    .select("role, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!staff) return null;

  return { userId: user.id, email: user.email ?? null, role: staff.role as StaffRole };
}

export function isSuperadmin(role: StaffRole) {
  return role === "superadmin";
}

export function canManagePayments(role: StaffRole) {
  return role === "superadmin" || role === "soporte_financiero";
}

import { createClient } from "@/lib/supabase/server";

export async function logAdminAction(action: string, targetType: string, targetId?: string, metadata: Record<string, unknown> = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.schema("app_mercago").from("audit_log").insert({
    actor_id: user?.id ?? null,
    action,
    target_type: targetType,
    target_id: targetId ?? null,
    metadata,
  });
}

import { createClient } from "@/lib/supabase/server";

export async function getMonetizationEnabled(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("app_mercago")
    .from("settings")
    .select("value")
    .eq("key", "monetization")
    .maybeSingle();
  const value = data?.value as { enabled?: boolean } | undefined;
  return Boolean(value?.enabled);
}

export async function setMonetizationEnabled(enabled: boolean, userId: string) {
  const supabase = await createClient();
  await supabase
    .schema("app_mercago")
    .from("settings")
    .update({ value: { enabled }, updated_by: userId, updated_at: new Date().toISOString() })
    .eq("key", "monetization");
}

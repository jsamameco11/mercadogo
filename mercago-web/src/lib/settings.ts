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

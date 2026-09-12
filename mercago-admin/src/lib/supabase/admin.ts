import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la secret key — bypassa RLS. SOLO usar en route handlers
// después de verificar getCurrentStaff(); nunca en código de cliente ni
// exponerlo con un nombre NEXT_PUBLIC_.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

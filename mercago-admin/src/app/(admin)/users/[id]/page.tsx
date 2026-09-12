import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", id).maybeSingle();
  const { data: userRow } = await supabase.from("users").select("created_at, is_blocked, is_suspended").eq("id", id).maybeSingle();
  if (!profile && !userRow) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, name, active, hidden, created_at")
    .eq("origin_app", "mercago")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title={profile?.display_name || "Usuario"} description={`Miembro desde ${userRow?.created_at ? new Date(userRow.created_at).toLocaleDateString() : "—"}`} />
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Perfil</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-xs text-muted-foreground">Usuario</dt><dd>{profile?.username || "—"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Bio</dt><dd>{profile?.bio || "—"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Bloqueado</dt><dd>{userRow?.is_blocked ? "Sí" : "No"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Suspendido</dt><dd>{userRow?.is_suspended ? "Sí" : "No"}</dd></div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publicaciones en MercaGo</p>
          <div className="mt-3 space-y-2">
            {(listings ?? []).map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                <span className="truncate">{l.name}</span>
                <StatusBadge status={l.hidden ? "hidden" : l.active ? "active" : "paused"} />
              </div>
            ))}
            {(!listings || listings.length === 0) && <p className="text-sm text-muted-foreground">Sin publicaciones.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

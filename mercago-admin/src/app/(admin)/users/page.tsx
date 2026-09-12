import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";

type SearchParams = { q?: string };

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("user_profiles")
    .select("user_id, display_name, first_name, last_name, username")
    .order("user_id", { ascending: false })
    .limit(50);

  if (q) query = query.or(`display_name.ilike.%${q}%,username.ilike.%${q}%`);

  const { data: profiles } = await query;

  const ids = (profiles ?? []).map((p) => p.user_id);
  const { data: counts } = ids.length
    ? await supabase.from("listings").select("user_id").eq("origin_app", "mercago").in("user_id", ids)
    : { data: [] as { user_id: string }[] };

  const listingCountByUser = new Map<string, number>();
  (counts ?? []).forEach((c) => listingCountByUser.set(c.user_id, (listingCountByUser.get(c.user_id) ?? 0) + 1));

  return (
    <div>
      <PageHeader title="Usuarios" description="Usuarios de la base maestra que han interactuado con el marketplace." />
      <div className="p-6">
        <form className="mb-4 max-w-sm">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o usuario..."
            className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3">Nombre</th>
                <th className="px-3">Usuario</th>
                <th className="px-3">Publicaciones</th>
                <th className="px-3">Perfil</th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p) => (
                <tr key={p.user_id} className="rounded-2xl bg-card">
                  <td className="rounded-l-2xl px-3 py-3">{p.display_name || `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{p.username || "—"}</td>
                  <td className="px-3 py-3">{listingCountByUser.get(p.user_id) ?? 0}</td>
                  <td className="rounded-r-2xl px-3 py-3">
                    <Link href={`/users/${p.user_id}`} className="text-accent hover:underline">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

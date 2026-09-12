import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .schema("app_mercago")
    .from("audit_log")
    .select("id, actor_id, action, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader title="Bitácora" description="Registro de acciones administrativas." />
      <div className="overflow-x-auto p-6">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3">Fecha</th>
              <th className="px-3">Acción</th>
              <th className="px-3">Objetivo</th>
              <th className="px-3">Actor</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="rounded-2xl bg-card">
                <td className="rounded-l-2xl px-3 py-3 text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-3 py-3 font-medium">{log.action}</td>
                <td className="px-3 py-3 text-muted-foreground">{log.target_type} {log.target_id?.slice(0, 8)}</td>
                <td className="rounded-r-2xl px-3 py-3 text-muted-foreground">{log.actor_id?.slice(0, 8) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!logs || logs.length === 0) && <p className="py-12 text-center text-sm text-muted-foreground">Sin actividad registrada.</p>}
      </div>
    </div>
  );
}

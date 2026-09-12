import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaff } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const staff = await getCurrentStaff();

  if (!staff) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Acceso restringido</p>
          <h1 className="mt-2 font-display text-xl font-semibold">Tu cuenta no tiene permisos de staff</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sesión iniciada como <strong>{user.email}</strong>, pero no tienes una fila activa en{" "}
            <code>app_mercago.staff</code>. Pide a un superadmin que te agregue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar email={staff.email} role={staff.role} />
      <main className="min-h-screen flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

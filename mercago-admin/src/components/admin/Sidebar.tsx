"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { StaffRole } from "@/lib/auth";

const NAV_GROUPS: { title: string; items: { href: string; label: string; roles?: StaffRole[] }[] }[] = [
  { title: "General", items: [{ href: "/dashboard", label: "Dashboard" }] },
  {
    title: "Marketplace",
    items: [
      { href: "/listings", label: "Anuncios" },
      { href: "/categories", label: "Categorías" },
      { href: "/reports", label: "Reportes" },
      { href: "/users", label: "Usuarios" },
    ],
  },
  {
    title: "Monetización",
    items: [
      { href: "/plans", label: "Planes y precios" },
      { href: "/payments", label: "Pagos y activaciones", roles: ["superadmin", "soporte_financiero"] },
      { href: "/settings", label: "Configuración", roles: ["superadmin"] },
    ],
  },
  { title: "Sistema", items: [{ href: "/audit", label: "Bitácora" }] },
];

const ROLE_LABELS: Record<StaffRole, string> = {
  superadmin: "Superadmin",
  moderador: "Moderador",
  soporte_financiero: "Soporte financiero",
};

export function Sidebar({ email, role }: { email: string | null; role: StaffRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">MercaGo</p>
        <p className="font-display text-lg font-semibold">Panel de control</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => !item.roles || item.roles.includes(role));
          if (!items.length) return null;
          return (
            <div key={group.title}>
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</p>
              <div className="mt-1 space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                        active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <p className="truncate text-sm font-medium">{ROLE_LABELS[role]}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
        <button onClick={logout} className="mt-3 w-full rounded-full border border-border py-2 text-xs font-medium hover:bg-muted">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

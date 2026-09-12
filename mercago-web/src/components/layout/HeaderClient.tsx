"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconChat, IconHeart, IconMenu, IconPlus, IconSearch, IconUser, IconClose } from "@/components/icons/line-art";

export function HeaderClient({ loggedIn, email }: { loggedIn: boolean; email: string | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <form action="/buscar" className="hidden flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 md:flex">
        <IconSearch className="h-4 w-4 text-muted-foreground" />
        <input
          name="q"
          placeholder="Buscar productos, marcas, categorías..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </form>

      <nav className="ml-auto hidden items-center gap-1 md:flex">
        <Link href="/publicar" className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
          <IconPlus className="h-4 w-4" /> Publicar
        </Link>
        {loggedIn ? (
          <>
            <Link href="/favoritos" className="rounded-full p-2 hover:bg-muted" title="Favoritos">
              <IconHeart className="h-5 w-5" />
            </Link>
            <Link href="/mensajes" className="rounded-full p-2 hover:bg-muted" title="Mensajes">
              <IconChat className="h-5 w-5" />
            </Link>
            <div className="group relative">
              <button className="flex items-center gap-2 rounded-full p-2 hover:bg-muted">
                <IconUser className="h-5 w-5" />
              </button>
              <div className="invisible absolute right-0 mt-1 w-56 rounded-2xl border border-border bg-card p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                <p className="truncate px-3 py-1.5 text-xs text-muted-foreground">{email}</p>
                <Link href="/mis-anuncios" className="block rounded-xl px-3 py-2 text-sm hover:bg-muted">Mis anuncios</Link>
                <Link href="/favoritos" className="block rounded-xl px-3 py-2 text-sm hover:bg-muted">Favoritos</Link>
                <Link href="/mensajes" className="block rounded-xl px-3 py-2 text-sm hover:bg-muted">Mensajes</Link>
                <Link href="/planes" className="block rounded-xl px-3 py-2 text-sm hover:bg-muted">Planes</Link>
                <button onClick={logout} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-muted">
                  Cerrar sesión
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link href="/login" className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Iniciar sesión
          </Link>
        )}
      </nav>

      <button className="ml-auto rounded-full p-2 hover:bg-muted md:hidden" onClick={() => setOpen((v) => !v)}>
        {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-b border-border bg-card p-4 shadow-lg md:hidden">
          <form action="/buscar" className="mb-3 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
            <IconSearch className="h-4 w-4 text-muted-foreground" />
            <input name="q" placeholder="Buscar..." className="w-full bg-transparent text-sm outline-none" />
          </form>
          <div className="flex flex-col gap-1">
            <Link href="/publicar" className="rounded-xl bg-accent px-3 py-2.5 text-center text-sm font-medium text-accent-foreground">
              Publicar producto
            </Link>
            {loggedIn ? (
              <>
                <Link href="/mis-anuncios" className="rounded-xl px-3 py-2.5 text-sm hover:bg-muted">Mis anuncios</Link>
                <Link href="/favoritos" className="rounded-xl px-3 py-2.5 text-sm hover:bg-muted">Favoritos</Link>
                <Link href="/mensajes" className="rounded-xl px-3 py-2.5 text-sm hover:bg-muted">Mensajes</Link>
                <Link href="/planes" className="rounded-xl px-3 py-2.5 text-sm hover:bg-muted">Planes</Link>
                <button onClick={logout} className="rounded-xl px-3 py-2.5 text-left text-sm text-danger hover:bg-muted">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/login" className="rounded-xl border border-border px-3 py-2.5 text-center text-sm font-medium">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

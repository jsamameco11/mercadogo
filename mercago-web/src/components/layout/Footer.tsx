import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold">MercaGo</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Publica tu producto o servicio y llega directo a quien lo está buscando — sin intermediarios.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Marketplace</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/buscar" className="hover:text-accent">Explorar productos</Link>
              <Link href="/publicar" className="hover:text-accent">Publicar producto</Link>
              <Link href="/planes" className="hover:text-accent">Planes de publicación</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ayuda y seguridad</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/buscar" className="hover:text-accent">Cómo funciona</Link>
              <Link href="/mensajes" className="hover:text-accent">Mensajes</Link>
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} MercaGo. La plataforma no procesa pagos entre compradores y vendedores.
        </p>
      </div>
    </footer>
  );
}

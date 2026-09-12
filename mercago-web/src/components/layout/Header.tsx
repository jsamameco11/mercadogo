import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeaderClient } from "@/components/layout/HeaderClient";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-foreground">R</span>
          <span className="hidden sm:inline">MercaGo</span>
        </Link>

        <HeaderClient loggedIn={Boolean(user)} email={user?.email ?? null} />
      </div>
    </header>
  );
}

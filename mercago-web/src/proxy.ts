import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/publicar", "/mis-anuncios", "/favoritos", "/mensajes"];

export async function proxy(request: NextRequest) {
  // Fuerza HTTPS. Google Identity Services envía el origin de la página a
  // Google, y "http://mercago..." no está (ni debe estar) registrado
  // como origin en Google Cloud Console.
  const host = request.headers.get("host") ?? "";
  const isInternalProbe = host.startsWith("127.0.0.1") || host.startsWith("localhost");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (request.headers.get("x-forwarded-proto") === "http" && siteUrl && !isInternalProbe) {
    return NextResponse.redirect(new URL(request.nextUrl.pathname + request.nextUrl.search, siteUrl), 308);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const needsAuth = PROTECTED_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  if (needsAuth && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};

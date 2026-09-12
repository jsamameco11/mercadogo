import { NextResponse, type NextRequest } from "next/server";

// Reenvía el intercambio del ID-token de Google a la función Edge
// compartida "google-session" desde NUESTRO servidor (no desde el
// navegador) — llamarla directo desde el cliente falla por el Origin.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    id_token?: string;
    email?: string;
    name?: string;
    sub?: string;
    install_id?: string;
  };

  if (!body.id_token) {
    return NextResponse.json({ message: "Falta el identificador de Google." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const res = await fetch(`${supabaseUrl}/functions/v1/google-session`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: body.id_token,
      email: body.email,
      name: body.name,
      sub: body.sub,
      install_id: body.install_id,
      app: "mercago",
    }),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

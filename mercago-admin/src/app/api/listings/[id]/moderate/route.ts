import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";

// La política RLS de public.listings solo permite update al dueño — no se
// toca el esquema maestro, así que la moderación (ocultar/mostrar/eliminar
// anuncios ajenos) pasa por esta ruta con service role, verificando staff.
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { action?: "hide" | "unhide" | "delete" };
  const admin = createAdminClient();

  if (body.action === "hide") {
    const { error } = await admin.from("listings").update({ hidden: true }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await logAdminAction("listing.hide", "listing", id);
  } else if (body.action === "unhide") {
    const { error } = await admin.from("listings").update({ hidden: false }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await logAdminAction("listing.unhide", "listing", id);
  } else if (body.action === "delete") {
    const { error } = await admin.from("listings").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await logAdminAction("listing.delete", "listing", id);
  } else {
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

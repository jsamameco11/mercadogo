import { NextResponse } from "next/server";
import { getCurrentStaff, canManagePayments } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";

export const runtime = "nodejs";

// Confirma un pago y activa el plan del usuario: crea/extiende su
// suscripción con los cupos del plan. La lógica completa de descuento de
// cupos por publicación es Fase 2 — aquí se deja la suscripción lista.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getCurrentStaff();
  if (!staff || !canManagePayments(staff.role)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { note?: string };
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .schema("app_mercago")
    .from("orders")
    .select("id, user_id, plan_id, status")
    .eq("id", id)
    .maybeSingle();

  if (orderError || !order) return NextResponse.json({ error: "Orden no encontrada." }, { status: 404 });
  if (order.status !== "pending") return NextResponse.json({ error: "Esta orden ya fue procesada." }, { status: 400 });

  const { data: plan } = await admin
    .schema("app_mercago")
    .from("plans")
    .select("listing_slots, duration_days")
    .eq("id", order.plan_id)
    .maybeSingle();

  if (!plan) return NextResponse.json({ error: "Plan no encontrado." }, { status: 400 });

  const expiresAt = new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString();

  const { error: subError } = await admin.schema("app_mercago").from("subscriptions").insert({
    user_id: order.user_id,
    plan_id: order.plan_id,
    order_id: order.id,
    slots_total: plan.listing_slots,
    slots_used: 0,
    expires_at: expiresAt,
    status: "active",
  });
  if (subError) return NextResponse.json({ error: subError.message }, { status: 400 });

  const { error: updateError } = await admin
    .schema("app_mercago")
    .from("orders")
    .update({ status: "confirmed", reviewed_by: staff.userId, reviewed_at: new Date().toISOString(), admin_note: body.note ?? null })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  await logAdminAction("order.confirm", "order", id, { plan_id: order.plan_id, user_id: order.user_id });

  return NextResponse.json({ ok: true });
}

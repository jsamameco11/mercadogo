import { NextResponse } from "next/server";
import { getCurrentStaff, canManagePayments } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getCurrentStaff();
  if (!staff || !canManagePayments(staff.role)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { note?: string };
  const admin = createAdminClient();

  const { error } = await admin
    .schema("app_mercago")
    .from("orders")
    .update({ status: "rejected", reviewed_by: staff.userId, reviewed_at: new Date().toISOString(), admin_note: body.note ?? null })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAdminAction("order.reject", "order", id, { note: body.note });

  return NextResponse.json({ ok: true });
}

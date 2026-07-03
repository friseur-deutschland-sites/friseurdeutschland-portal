import { requireAdmin } from "../../../../../lib/session";
import { sb } from "../../../../../lib/db";

export async function PATCH(req, { params }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const allowed = ["role", "is_active", "can_self_create", "can_create_free", "is_premium", "telegram_user_id"];
  const payload = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  await sb(`portal_users?id=eq.${params.id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return Response.json({ ok: true });
}

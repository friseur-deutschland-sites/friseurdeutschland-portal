import { requireAdmin } from "../../../../../lib/session";
import { sb } from "../../../../../lib/db";

export async function PATCH(req, { params }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const allowed = ["status", "live_url", "expires_at", "city", "logo_url", "cover_photo_url"];
  const payload = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  if (Object.keys(payload).length === 0) return Response.json({ error: "No valid fields" }, { status: 400 });

  await sb(`salon_projects?project_id=eq.${params.id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return Response.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  await sb(`salon_projects?project_id=eq.${params.id}`, { method: "DELETE" });
  return Response.json({ ok: true });
}

import { requireAdmin } from "../../../../../lib/session";
import { sb } from "../../../../../lib/db";

export async function PATCH(req, { params }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  await sb(`listings?id=eq.${params.id}`, { method: "PATCH", body: JSON.stringify(body) });
  return Response.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  await sb(`listings?id=eq.${params.id}`, { method: "DELETE" });
  return Response.json({ ok: true });
}

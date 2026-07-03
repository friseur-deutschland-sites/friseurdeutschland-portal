import { requireAdmin } from "../../../../../lib/session";
import { sb } from "../../../../../lib/db";

export async function PATCH(req, { params }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = params;
  const body = await req.json().catch(() => ({}));

  const allowed = ["amount", "status", "notes", "due_date"];
  const payload = {};
  for (const k of allowed) {
    if (k in body) payload[k] = body[k];
  }
  if (typeof payload.amount !== "undefined") payload.amount = parseFloat(payload.amount) || 0;

  if (Object.keys(payload).length === 0)
    return Response.json({ error: "Keine Felder zum Aktualisieren." }, { status: 400 });

  await sb(`billing_records?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return Response.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = params;
  await sb(`billing_records?id=eq.${id}`, { method: "DELETE" });
  return Response.json({ ok: true });
}

import { requireAdmin } from "../../../../../../lib/session";
import { sb } from "../../../../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req, { params }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const { new_password } = body;

  if (!new_password || new_password.length < 8)
    return Response.json({ error: "Passwort mindestens 8 Zeichen." }, { status: 400 });

  const hashed = await bcrypt.hash(new_password, 12);

  await sb(`portal_users?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ password_hash: hashed }),
  });

  return Response.json({ ok: true });
}

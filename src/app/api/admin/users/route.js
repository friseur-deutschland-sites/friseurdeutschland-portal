import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const users = await sb(
    "portal_users?select=id,email,role,is_active,can_self_create,can_create_free,is_premium,telegram_user_id,created_at&order=created_at.desc"
  ).catch(() => []);
  return Response.json({ users: users || [] });
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { email, password, role = "customer", is_active = true, can_self_create = false, can_create_free = false, is_premium = false, telegram_user_id } = body;

  if (!email || !password) return Response.json({ error: "E-Mail und Passwort erforderlich." }, { status: 400 });
  if (password.length < 8) return Response.json({ error: "Passwort mindestens 8 Zeichen." }, { status: 400 });

  const existing = await sb(`portal_users?email=eq.${encodeURIComponent(email)}&select=id`).catch(() => []);
  if (existing?.length > 0) return Response.json({ error: "E-Mail bereits vergeben." }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);

  const payload = {
    email,
    password_hash: hashed,
    role,
    is_active,
    can_self_create,
    can_create_free,
    is_premium,
    ...(telegram_user_id ? { telegram_user_id } : {}),
  };

  const result = await sb("portal_users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const created = Array.isArray(result) ? result[0] : result;
  return Response.json({ id: created?.id }, { status: 201 });
}

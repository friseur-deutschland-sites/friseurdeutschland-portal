import { sb } from "../../../../lib/db";
import { hashPassword } from "../../../../lib/password";

export async function POST(req) {
  const settings = await sb(`portal_settings?key=eq.self_registration_enabled&limit=1`).catch(() => null);
  if (!settings?.[0] || settings[0].value !== "true") {
    return Response.json({ error: "Registrierung ist aktuell nicht möglich." }, { status: 403 });
  }

  const body = await req.json();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || password.length < 8) {
    return Response.json({ error: "Gültige E-Mail und mindestens 8 Zeichen langes Passwort erforderlich." }, { status: 400 });
  }

  const existing = await sb(`portal_users?email=eq.${encodeURIComponent(email)}&limit=1`).catch(() => null);
  if (existing?.length > 0) {
    return Response.json({ error: "Diese E-Mail ist bereits registriert." }, { status: 409 });
  }

  const password_hash = await hashPassword(password);
  await sb(`portal_users`, {
    method: "POST",
    body: JSON.stringify({ email, password_hash, role: "customer", is_active: true, can_self_create: false }),
  });

  return Response.json({ ok: true });
}

import { getSession } from "../../../../lib/session";
import { sb } from "../../../../lib/db";
import { hashPassword, verifyPassword } from "../../../../lib/password";

export async function POST(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  if (!currentPassword || !newPassword)
    return Response.json({ error: "Aktuelles und neues Passwort erforderlich." }, { status: 400 });
  if (newPassword.length < 8)
    return Response.json({ error: "Neues Passwort: mindestens 8 Zeichen." }, { status: 400 });

  const users = await sb(`portal_users?id=eq.${session.id}&select=id,password_hash`);
  const user = users?.[0];
  if (!user) return Response.json({ error: "Benutzer nicht gefunden." }, { status: 404 });

  const ok = await verifyPassword(currentPassword, user.password_hash);
  if (!ok) return Response.json({ error: "Aktuelles Passwort ist falsch." }, { status: 403 });

  const password_hash = await hashPassword(newPassword);
  await sb(`portal_users?id=eq.${session.id}`, {
    method: "PATCH",
    body: JSON.stringify({ password_hash }),
  });

  return Response.json({ ok: true });
}

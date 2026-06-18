import { sb } from "../../../../lib/db";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "../../../../lib/auth";
import { verifyPassword } from "../../../../lib/password";

export async function POST(req) {
  const body = await req.json();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    return Response.json({ error: "E-posta und Passwort erforderlich." }, { status: 400 });
  }

  const users = await sb(`portal_users?email=eq.${encodeURIComponent(email)}&limit=1`);
  const user = users?.[0];

  if (!user || !user.is_active) {
    return Response.json({ error: "Ungültige Anmeldedaten oder Konto inaktiv." }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return Response.json({ error: "Ungültige Anmeldedaten." }, { status: 401 });
  }

  const token = await createSessionToken({ id: user.id, email: user.email, role: user.role });
  const res = Response.json({ role: user.role });
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );
  return res;
}

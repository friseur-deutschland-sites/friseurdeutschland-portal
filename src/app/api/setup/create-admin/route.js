import { sb } from "../../../../lib/db";
import { hashPassword } from "../../../../lib/password";

// One-time setup endpoint — disable after first use by removing the SETUP_TOKEN env var
export async function POST(req) {
  const token = process.env.SETUP_TOKEN;
  if (!token) return Response.json({ error: "Setup disabled" }, { status: 403 });

  const body = await req.json();
  if (body.token !== token) return Response.json({ error: "Invalid token" }, { status: 403 });

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || password.length < 8) {
    return Response.json({ error: "Valid email and password (min 8 chars) required" }, { status: 400 });
  }

  const existing = await sb(`portal_users?email=eq.${encodeURIComponent(email)}&limit=1`).catch(() => null);
  if (existing?.length > 0) {
    await sb(`portal_users?email=eq.${encodeURIComponent(email)}`, {
      method: "PATCH",
      body: JSON.stringify({ role: "admin", is_active: true }),
    });
    return Response.json({ ok: true, message: "Existing user promoted to admin" });
  }

  const password_hash = await hashPassword(password);
  await sb("portal_users", {
    method: "POST",
    body: JSON.stringify({ email, password_hash, role: "admin", is_active: true }),
  });

  return Response.json({ ok: true, message: "Admin user created" });
}

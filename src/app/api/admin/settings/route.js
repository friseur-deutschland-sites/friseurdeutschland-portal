import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const rows = await sb("portal_settings?select=key,value").catch(() => []);
  const settings = Object.fromEntries((rows || []).map(r => [r.key, r.value]));
  return Response.json({ settings });
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { settings } = await req.json();
  if (!settings || typeof settings !== "object") return Response.json({ error: "Invalid" }, { status: 400 });

  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      sb("portal_settings", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ key, value }),
      }).catch(() => null)
    )
  );

  return Response.json({ ok: true });
}

import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const listings = await sb("listings?select=*&order=created_at.desc").catch(() => []);
  return Response.json({ listings: listings || [] });
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const res = await sb("listings", { method: "POST", body: JSON.stringify(body) });
  return Response.json({ id: res?.[0]?.id || null });
}

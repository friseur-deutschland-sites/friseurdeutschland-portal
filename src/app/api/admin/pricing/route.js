import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const plans = await sb("pricing_plans?select=*&order=price.asc").catch(() => []);
  return Response.json({ plans: plans || [] });
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const res = await sb("pricing_plans", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return Response.json({ id: res?.[0]?.id || null });
}

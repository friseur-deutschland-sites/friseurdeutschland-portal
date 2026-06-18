import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const records = await sb("billing_records?select=id,project_id,user_id,plan_id,amount,status,paypal_order_id,created_at&order=created_at.desc&limit=200").catch(() => []);
  return Response.json({ records: records || [] });
}

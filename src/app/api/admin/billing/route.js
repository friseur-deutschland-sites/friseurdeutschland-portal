import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const records = await sb(
    "billing_records?select=id,project_id,user_id,plan_id,amount,status,notes,due_date,paypal_order_id,created_at&order=created_at.desc&limit=500"
  ).catch(() => []);
  return Response.json({ records: records || [] });
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { project_id, user_id, plan_id, amount, status = "pending", notes, due_date } = body;

  if (!amount && amount !== 0) return Response.json({ error: "Betrag erforderlich." }, { status: 400 });

  const payload = {
    amount: parseFloat(amount) || 0,
    status,
    ...(project_id ? { project_id } : {}),
    ...(user_id    ? { user_id }    : {}),
    ...(plan_id    ? { plan_id }    : {}),
    ...(notes      ? { notes }      : {}),
    ...(due_date   ? { due_date }   : {}),
  };

  const result = await sb("billing_records", {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch(e => { throw e; });

  const created = Array.isArray(result) ? result[0] : result;
  return Response.json({ record: created }, { status: 201 });
}

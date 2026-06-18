import { getSession } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getPayPalToken() {
  const creds = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { order_id, project_id, plan_id } = await req.json();
  if (!order_id || !project_id) return Response.json({ error: "order_id and project_id required" }, { status: 400 });

  const token = await getPayPalToken();
  const capture = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${order_id}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  }).then(r => r.json());

  if (capture.status !== "COMPLETED") {
    return Response.json({ error: "Payment not completed", details: capture }, { status: 400 });
  }

  const amount = parseFloat(capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || 0);
  const expiresAt = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();

  await Promise.all([
    sb("billing_records", {
      method: "POST",
      body: JSON.stringify({
        project_id, user_id: session.id, plan_id: plan_id || null,
        amount, status: "completed", paypal_order_id: order_id, created_at: new Date().toISOString(),
      }),
    }),
    sb(`salon_projects?project_id=eq.${project_id}`, {
      method: "PATCH",
      body: JSON.stringify({ plan_id: plan_id || null, expires_at: expiresAt, paid_at: new Date().toISOString() }),
    }),
  ]).catch(() => null);

  return Response.json({ ok: true, expires_at: expiresAt });
}

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

  const { project_id, plan_id } = await req.json();
  if (!project_id || !plan_id) return Response.json({ error: "project_id and plan_id required" }, { status: 400 });

  const plans = await sb(`pricing_plans?id=eq.${plan_id}&limit=1`).catch(() => []);
  const plan = plans?.[0];
  if (!plan) return Response.json({ error: "Plan not found" }, { status: 404 });

  const token = await getPayPalToken();
  const order = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: project_id,
        amount: { currency_code: "EUR", value: String(plan.price) },
        description: `FriseurDeutschland — ${plan.name}`,
      }],
    }),
  }).then(r => r.json());

  return Response.json({ order_id: order.id });
}

import { sb } from "../../../lib/db";

export async function GET() {
  try {
    const plans = await sb("pricing_plans?select=*&is_active=eq.true&order=price.asc");
    return Response.json({ plans: plans || [] });
  } catch {
    return Response.json({ plans: [] });
  }
}

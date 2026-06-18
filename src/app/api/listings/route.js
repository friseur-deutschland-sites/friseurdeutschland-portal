import { sb } from "../../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const listings = await sb(`listings?select=*&is_active=eq.true&order=created_at.desc&limit=${limit}`);
    return Response.json({ listings: listings || [] });
  } catch {
    return Response.json({ listings: [] });
  }
}

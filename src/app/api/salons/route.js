import { NextResponse } from "next/server";
import { sb } from "../../../lib/db";
import { BRAND } from "../../../lib/brand";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  let query = `public_salons?select=*&order=created_at.desc&limit=200`;
  if (city && city !== "alle") {
    query += `&city=ilike.*${encodeURIComponent(city)}*`;
  }

  // Her portal yalnızca kendi işletme tipini listeler; kolon yoksa filtresiz düş
  let data;
  try {
    data = await sb(`${query}&business_type=eq.${BRAND.businessType}`);
  } catch {
    try {
      data = await sb(query);
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ salons: data || [] });
}

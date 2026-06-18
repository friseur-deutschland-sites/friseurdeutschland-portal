import { NextResponse } from "next/server";
import { getServiceClient } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  const db = getServiceClient();
  let query = db
    .from("public_salons")
    .select("*")
    .order("review_count", { ascending: false });

  if (city && city !== "alle") {
    query = query.ilike("city", `%${city}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ salons: data || [] });
}

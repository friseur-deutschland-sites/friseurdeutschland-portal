import { NextResponse } from "next/server";
import { getServiceClient } from "../../../lib/supabase";

export async function POST(request) {
  const body = await request.json();
  const { review_token, rating, comment, guest_name } = body;

  if (!review_token || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });
  }

  const db = getServiceClient();

  // Token geçerli mi? (appointments tablosunda review_token sütunu)
  const { data: appt } = await db
    .from("appointments")
    .select("id, project_id, review_token, review_done")
    .eq("review_token", review_token)
    .single();

  if (!appt) return NextResponse.json({ error: "Ungültiger Token" }, { status: 404 });
  if (appt.review_done) return NextResponse.json({ error: "Bereits bewertet" }, { status: 409 });

  // Review kaydet
  const { error } = await db.from("reviews").insert({
    project_id: appt.project_id,
    appointment_id: appt.id,
    review_token,
    rating,
    comment: comment?.slice(0, 500) || "",
    guest_name: guest_name?.slice(0, 80) || "",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Tamamlandı olarak işaretle
  await db.from("appointments").update({ review_done: true }).eq("id", appt.id);

  return NextResponse.json({ success: true });
}

import { getSession } from "../../../lib/session";
import { sb } from "../../../lib/db";
import { randomUUID } from "crypto";

export async function POST(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const planId = body.plan_id || null;

  const project_id = randomUUID();
  const now = new Date().toISOString();

  try {
    await sb("salon_projects", {
      method: "POST",
      body: JSON.stringify({
        project_id,
        user_id: session.id,
        plan_id: planId,
        // Portal üzerinden oluşturulan projelerde Telegram henüz bağlı değil;
        // kolon NOT NULL olduğu için boş string gönderilir.
        telegram_user_id: "",
        status: "pending",
        current_step: "portal_created",
        created_at: now,
      }),
    });
  } catch (e) {
    console.error("Projekt konnte nicht erstellt werden:", e.message);
    return Response.json(
      { error: `Projekt konnte nicht erstellt werden: ${e.message}` },
      { status: 500 }
    );
  }

  return Response.json({ project_id });
}

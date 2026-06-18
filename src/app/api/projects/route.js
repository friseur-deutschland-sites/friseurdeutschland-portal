import { getSession } from "../../../lib/session";
import { sb } from "../../../lib/db";
import { randomUUID } from "crypto";

export async function POST(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const planId = body.plan_id || null;

  const project_id = randomUUID();
  const now = new Date().toISOString();

  await sb("salon_projects", {
    method: "POST",
    body: JSON.stringify({
      project_id,
      user_id: session.id,
      plan_id: planId,
      status: "pending",
      created_at: now,
    }),
  });

  return Response.json({ project_id });
}

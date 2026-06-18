import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { project_id } = await req.json();
  if (!project_id) return Response.json({ error: "project_id required" }, { status: 400 });

  await sb(`salon_projects?project_id=eq.${project_id}`, {
    method: "PATCH",
    body: JSON.stringify({ pipeline_trigger: new Date().toISOString() }),
  }).catch(() => null);

  return Response.json({ ok: true, message: "Pipeline trigger saved. The Python bot will pick this up on its next poll." });
}

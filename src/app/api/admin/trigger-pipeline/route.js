import { requireAdmin } from "../../../../lib/session";
import { sb } from "../../../../lib/db";

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { project_id } = await req.json();
  if (!project_id) return Response.json({ error: "project_id required" }, { status: 400 });

  const projects = await sb(
    `salon_projects?project_id=eq.${project_id}&select=project_id,current_step,status`
  ).catch(() => []);
  const project = projects?.[0];
  if (!project) return Response.json({ error: "Proje bulunamadı." }, { status: 404 });

  const webhookUrl = process.env.PIPELINE_WEBHOOK_URL;
  const webhookSecret = process.env.PIPELINE_WEBHOOK_SECRET;
  if (!webhookUrl) {
    return Response.json({ error: "PIPELINE_WEBHOOK_URL tanımlı değil." }, { status: 500 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  let webhookOk = false;
  let errorText = "";

  try {
    const res = await fetch(`${webhookUrl}/friseur/trigger-pipeline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pipeline-secret": webhookSecret || "",
      },
      body: JSON.stringify({ project_id }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      webhookOk = true;
    } else {
      errorText = await res.text().catch(() => `HTTP ${res.status}`);
    }
  } catch (e) {
    clearTimeout(timer);
    errorText = e.name === "AbortError" ? "Webhook zaman aşımı (20s) — sunucu erişilemiyor" : e.message;
  }

  if (!webhookOk) {
    return Response.json({ error: errorText }, { status: 502 });
  }

  await sb(`salon_projects?project_id=eq.${project_id}`, {
    method: "PATCH",
    body: JSON.stringify({ current_step: "pipeline_queued", status: "in_progress" }),
  }).catch(() => null);

  return Response.json({ ok: true });
}

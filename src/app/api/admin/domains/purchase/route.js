import { requireAdmin } from "../../../../../lib/session";

export const maxDuration = 60;

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { project_id, domain } = await req.json();
  if (!project_id || !domain || !domain.includes("."))
    return Response.json({ error: "project_id ve geçerli bir domain gerekli." }, { status: 400 });

  const webhookUrl = process.env.PIPELINE_WEBHOOK_URL;
  const webhookSecret = process.env.PIPELINE_WEBHOOK_SECRET;
  if (!webhookUrl)
    return Response.json({ error: "PIPELINE_WEBHOOK_URL tanımlı değil." }, { status: 500 });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(`${webhookUrl}/friseur/domain-purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pipeline-secret": webhookSecret || "",
      },
      body: JSON.stringify({ project_id, domain }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return Response.json({ error: data.detail || `Webhook hatası (${res.status})` }, { status: 502 });
    // Satın alma arka planda devam eder; sonuç Telegram'dan bildirilir
    return Response.json({ ok: true, started: true, domain: data.domain });
  } catch (e) {
    clearTimeout(timer);
    const msg = e.name === "AbortError" ? "Webhook zaman aşımı (45s)" : e.message;
    return Response.json({ error: msg }, { status: 502 });
  }
}

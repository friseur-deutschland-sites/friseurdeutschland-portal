import { requireAdmin } from "../../../../../lib/session";

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { domain } = await req.json();
  if (!domain || !domain.includes("."))
    return Response.json({ error: "Geçerli bir domain girin (örn. mein-salon.de)." }, { status: 400 });

  const webhookUrl = process.env.PIPELINE_WEBHOOK_URL;
  const webhookSecret = process.env.PIPELINE_WEBHOOK_SECRET;
  if (!webhookUrl)
    return Response.json({ error: "PIPELINE_WEBHOOK_URL tanımlı değil." }, { status: 500 });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${webhookUrl}/friseur/domain-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pipeline-secret": webhookSecret || "",
      },
      body: JSON.stringify({ domain }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return Response.json({ error: data.detail || `Webhook hatası (${res.status})` }, { status: 502 });
    return Response.json({ ok: true, domain: data.domain, available: data.available });
  } catch (e) {
    clearTimeout(timer);
    const msg = e.name === "AbortError" ? "Webhook zaman aşımı (30s)" : e.message;
    return Response.json({ error: msg }, { status: 502 });
  }
}

import { getSession } from "../../../lib/session";
import { sb } from "../../../lib/db";
import { randomUUID } from "crypto";

export async function POST(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const {
    plan_id = null,
    salon_name = "",
    address = "",
    phone = "",
    email = "",
    description = "",
    opening_hours = {},
    domain_type = "subdomain",
    desired_domain = "",
    logo_url = "",
    price_list_urls = [],
    template_id = "",
  } = body;

  const ALLOWED_TEMPLATES = ["appointment_01", "appointment_02", "appointment_03", "appointment_04", "appointment_05"];
  const chosenTemplate = ALLOWED_TEMPLATES.includes(template_id) ? template_id : "";

  if (!salon_name.trim() || !address.trim()) {
    return Response.json({ error: "Salonname und Adresse sind erforderlich." }, { status: 400 });
  }

  const project_id = randomUUID();
  const now = new Date().toISOString();

  try {
    await sb("salon_projects", {
      method: "POST",
      body: JSON.stringify({
        project_id,
        user_id: session.id,
        plan_id,
        salon_name: salon_name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        contact_email: email.trim(),
        description: description.trim(),
        opening_hours,
        domain_type: domain_type === "own" ? "own" : "subdomain",
        desired_domain: desired_domain.trim(),
        logo_url: logo_url || "",
        price_list_urls: Array.isArray(price_list_urls) ? price_list_urls : [],
        // Boş bırakılırsa pipeline otomatik seçer
        template_id: chosenTemplate,
        website_type: "appointment",
        // Portal üzerinden oluşturulan projelerde Telegram henüz bağlı değil;
        // kolon NOT NULL olduğu için boş string gönderilir.
        telegram_user_id: "",
        status: "pending",
        current_step: "form_submitted",
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

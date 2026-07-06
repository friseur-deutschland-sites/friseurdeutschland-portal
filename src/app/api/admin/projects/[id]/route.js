import { requireAdmin } from "../../../../../lib/session";
import { sb } from "../../../../../lib/db";

// GET: proje detayı + fatura kayıtları (detay modalı için)
export async function GET(req, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = params;

    const rows = await sb(`salon_projects?project_id=eq.${id}&select=*`);
    if (!rows?.[0]) return Response.json({ error: "Proje bulunamadı." }, { status: 404 });

    const billing = await sb(
      `billing_records?project_id=eq.${id}&select=amount,status,notes,due_date,created_at&order=created_at.asc`
    ).catch(() => []);

    return Response.json({ project: rows[0], billing: billing || [] });
  } catch (e) {
    console.error("GET /api/admin/projects/[id] hata:", e);
    return Response.json({ error: e.message || "Veri yüklenemedi." }, { status: 500 });
  }
}

// PATCH: durum/adım/alan güncelle (iptal ve pipeline sıfırlama dahil)
export async function PATCH(req, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const allowed = [
      "status", "current_step", "errors", "salon_name", "live_url",
      "expires_at", "city", "logo_url", "cover_photo_url", "template_id",
    ];
    const payload = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

    if (Object.keys(payload).length === 0) return Response.json({ error: "No valid fields" }, { status: 400 });

    await sb(`salon_projects?project_id=eq.${params.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return Response.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/admin/projects/[id] hata:", e);
    return Response.json({ error: e.message || "Güncelleme başarısız." }, { status: 500 });
  }
}

// DELETE: projeyi tamamen kaldır (Vercel + bağlı tablolar + DB)
export async function DELETE(req, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });
    const { id } = params;

    const rows = await sb(
      `salon_projects?project_id=eq.${id}&select=vercel_project_id,live_url,purchased_domain`
    );
    const project = rows?.[0];
    if (!project) return Response.json({ error: "Proje bulunamadı." }, { status: 404 });

    const results = { vercel: null, db: null };

    // 1. Vercel projesini sil
    const vercelProjectId = project.vercel_project_id;
    if (vercelProjectId && process.env.VERCEL_TOKEN) {
      try {
        const vRes = await fetch(
          `https://api.vercel.com/v9/projects/${vercelProjectId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
          }
        );
        results.vercel = vRes.status === 204 ? "silindi" : `HTTP ${vRes.status}`;
      } catch (e) {
        results.vercel = `hata: ${e.message}`;
      }
    } else {
      results.vercel = vercelProjectId ? "VERCEL_TOKEN eksik" : "vercel_project_id yok (atlandı)";
    }

    // 2. Fatura kayıtlarını iptal et (silme — muhasebe izi kalsın)
    await sb(`billing_records?project_id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "refunded" }),
    }).catch(() => null);

    // 3. Bağlı tabloları temizle (foreign key ihlali önlemek için)
    await Promise.all([
      sb(`appointments?project_id=eq.${id}`, { method: "DELETE" }).catch(() => null),
      sb(`salon_services?project_id=eq.${id}`, { method: "DELETE" }).catch(() => null),
      sb(`salon_settings?project_id=eq.${id}`, { method: "DELETE" }).catch(() => null),
      sb(`staff?project_id=eq.${id}`, { method: "DELETE" }).catch(() => null),
      sb(`reviews?project_id=eq.${id}`, { method: "DELETE" }).catch(() => null),
      sb(`verification_codes?project_id=eq.${id}`, { method: "DELETE" }).catch(() => null),
    ]);

    // 4. Projeyi DB'den sil
    await sb(`salon_projects?project_id=eq.${id}`, { method: "DELETE" });
    results.db = "silindi";

    return Response.json({
      ok: true,
      results,
      domain_note: project.purchased_domain
        ? `Domain '${project.purchased_domain}' manuel olarak Namecheap'ten iptal edilmeli.`
        : null,
    });
  } catch (e) {
    console.error("DELETE /api/admin/projects/[id] hata:", e);
    return Response.json({ error: e.message || "Silme işlemi başarısız." }, { status: 500 });
  }
}

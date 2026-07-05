"use client";

import { useEffect, useState } from "react";

const ALL_STEPS = [
  { key: "form_submitted", label: "Bilgiler Gönderildi" },
  { key: "pipeline_queued", label: "Pipeline Kuyruğa Alındı" },
  { key: "content_generation", label: "İçerik Oluşturuluyor" },
  { key: "assembling", label: "Site Derleniyor" },
  { key: "domain_check", label: "Domain Kontrol" },
  { key: "deployment", label: "Yayınlanıyor" },
  { key: "done", label: "Tamamlandı" },
];

const STEP_ORDER = ALL_STEPS.map((s) => s.key);

function stepIndex(step) {
  if (!step) return -1;
  if (step === "cancelled") return -2;
  return STEP_ORDER.indexOf(step);
}

export default function ProjectDetailModal({ projectId, onClose, onUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState(null);
  const [result, setResult] = useState(null);
  const [priceScanUrl, setPriceScanUrl] = useState("");
  const [showPriceScan, setShowPriceScan] = useState(false);
  const [showDomain, setShowDomain] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [domainCheck, setDomainCheck] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/projects/${projectId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Veri yüklenemedi."); setLoading(false); });
  }, [projectId]);

  const project = data?.project;
  const billing = data?.billing || [];
  const currentIdx = project ? stepIndex(project.current_step) : -1;
  const isCancelled = project?.current_step === "cancelled" || project?.status === "cancelled";
  const isDone = project?.current_step === "done" || project?.status === "completed";
  const projectErrors = Array.isArray(project?.errors) ? project.errors : [];

  async function triggerPipeline() {
    const isRestart = project.current_step !== "form_submitted";
    const confirmMsg = isDone
      ? "Site yeniden derlenip yayınlanacak. Görseller ve içerik güncellenecek. Devam edilsin mi?"
      : isRestart
        ? "Pipeline sıfırlanıp yeniden başlatılsın mı? Mevcut adım 'form_submitted'e döndürülecek."
        : "Pipeline başlatılsın mı?";
    if (!confirm(confirmMsg)) return;
    setAction("pipeline");
    setError("");
    try {
      if (isRestart) {
        const resetRes = await fetch(`/api/admin/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current_step: "form_submitted", status: "pending", errors: [] }),
        });
        if (!resetRes.ok) {
          const d = await resetRes.json().catch(() => ({}));
          setError(d.error || "Sıfırlama başarısız.");
          return;
        }
      }
      const res = await fetch("/api/admin/trigger-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error || `Webhook hatası (${res.status})`); return; }
      setResult("✅ Pipeline başlatıldı!");
      onUpdated?.();
    } catch (e) {
      setError("Bağlantı hatası: " + e.message);
    } finally {
      setAction(null);
    }
  }

  async function triggerPriceScan() {
    if (!priceScanUrl.trim()) return;
    if (!confirm(`Fiyat listesi fotoğrafı taranıp hizmetler otomatik oluşturulsun mu?\n${priceScanUrl}`)) return;
    setAction("pricescan");
    setError("");
    try {
      const res = await fetch("/api/admin/price-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, image_url: priceScanUrl.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error || `Hata (${res.status})`); return; }
      setResult(`✅ Fiyat listesi tarandı! ${d.total} hizmet oluşturuldu (${d.matched} katalog, ${d.custom} özel).`);
      setPriceScanUrl("");
      setShowPriceScan(false);
    } catch (e) {
      setError("Bağlantı hatası: " + e.message);
    } finally {
      setAction(null);
    }
  }

  async function generateLogo() {
    if (!confirm("KI ile yeni logo oluşturulsun mu? Mevcut logo değiştirilir.")) return;
    setAction("logo");
    setError("");
    try {
      const res = await fetch("/api/admin/logo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, salon_name: project.salon_name || "" }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error || `Hata (${res.status})`); return; }
      setResult(`✅ Logo oluşturuldu!\n${d.url}`);
      onUpdated?.();
    } catch (e) {
      setError("Bağlantı hatası: " + e.message);
    } finally {
      setAction(null);
    }
  }

  async function checkDomain() {
    const domain = domainInput.trim().toLowerCase();
    if (!domain) return;
    setAction("domaincheck");
    setError("");
    setDomainCheck(null);
    try {
      const res = await fetch("/api/admin/domains/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error || `Hata (${res.status})`); return; }
      setDomainCheck(d);
    } catch (e) {
      setError("Bağlantı hatası: " + e.message);
    } finally {
      setAction(null);
    }
  }

  async function buyDomain() {
    const domain = domainCheck?.domain;
    if (!domain) return;
    if (!confirm(`'${domain}' satın alınacak (1 yıl, Namecheap) ve site bu adrese taşınacak.\n\nDevam edilsin mi?`)) return;
    setAction("domainbuy");
    setError("");
    try {
      const res = await fetch("/api/admin/domains/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, domain }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error || `Hata (${res.status})`); return; }
      setResult(
        `✅ ${domain} satın alma başlatıldı!\n\n` +
        `Satın alma ve taşıma arka planda sürüyor — sonuç Telegram'dan bildirilecek. ` +
        `DNS yayılımı 1-24 saat sürebilir; eski subdomain çalışmaya devam eder.`
      );
      setShowDomain(false);
      setDomainCheck(null);
      setDomainInput("");
      onUpdated?.();
    } catch (e) {
      setError("Bağlantı hatası: " + e.message);
    } finally {
      setAction(null);
    }
  }

  async function terminate() {
    if (!confirm("Bu projeyi iptal etmek istiyor musunuz? Müşteriye bildirim gönderilmez.")) return;
    setAction("terminating");
    setError("");
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", current_step: "cancelled" }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { setResult("Proje iptal edildi."); onUpdated?.(); }
      else setError(d.error || `Sunucu hatası (${res.status})`);
    } catch (e) {
      setError("Bağlantı hatası: " + e.message);
    } finally {
      setAction(null);
    }
  }

  async function remove() {
    if (!confirm("Projeyi TÜM platformlardan kaldırmak istiyor musunuz? Bu işlem geri alınamaz.")) return;
    setAction("removing");
    setError("");
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        const parts = [
          `Vercel: ${d.results?.vercel || "?"}`,
          `DB: ${d.results?.db || "?"}`,
          d.domain_note ? `⚠️ ${d.domain_note}` : null,
        ].filter(Boolean).join("\n");
        setResult(`Proje kaldırıldı.\n\n${parts}`);
        onUpdated?.();
      } else {
        setError(d.error || `Sunucu hatası (${res.status})`);
      }
    } catch (e) {
      setError("Bağlantı hatası: " + e.message);
    } finally {
      setAction(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-ink/10">
          <div>
            <h2 className="font-display font-bold text-xl">
              {loading ? "Yükleniyor…" : (project?.salon_name || "Proje Detayı")}
            </h2>
            {project && (
              <p className="text-sm text-slate mt-0.5">
                {project.contact_email || project.telegram_user_id || "—"}
                {" · "}
                {new Date(project.created_at).toLocaleDateString("de-DE")}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate hover:text-ink text-xl leading-none ml-4">✕</button>
        </div>

        <div className="p-5 space-y-6">
          {loading && <p className="text-slate text-sm">Veri yükleniyor…</p>}
          {error && <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800 whitespace-pre-wrap">
              {result}
            </div>
          )}

          {project && (
            <>
              {/* Süreç Çizelgesi */}
              <section>
                <h3 className="font-semibold text-sm uppercase tracking-wide text-slate mb-3">Süreç Çizelgesi</h3>
                {isCancelled ? (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                    <span className="text-lg">🚫</span> Bu proje iptal edildi.
                  </div>
                ) : (
                  <ol className="relative border-l-2 border-ink/10 ml-3 space-y-0">
                    {ALL_STEPS.map((step, i) => {
                      const done = i < currentIdx || (isDone && i === STEP_ORDER.length - 1);
                      const active = i === currentIdx && !isDone;
                      const pending = i > currentIdx;
                      return (
                        <li key={step.key} className="ml-4 pb-4 last:pb-0">
                          <span
                            className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px]
                              ${done ? "bg-green-500 border-green-500 text-white" :
                                active ? "bg-accent border-accent text-white animate-pulse" :
                                "bg-white border-ink/20 text-slate"}`}
                          >
                            {done ? "✓" : active ? "●" : ""}
                          </span>
                          <p className={`text-sm font-medium ml-1 ${pending ? "text-slate/50" : active ? "text-accent font-semibold" : "text-ink"}`}>
                            {step.label}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>

              {/* Hata Kayıtları */}
              {projectErrors.length > 0 && (
                <section>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-slate mb-3">Hata Kayıtları</h3>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                    {projectErrors.map((e, i) => (
                      <p key={i} className="text-xs font-mono text-red-700">{typeof e === "string" ? e : JSON.stringify(e)}</p>
                    ))}
                  </div>
                </section>
              )}

              {/* Proje Bilgileri */}
              <section>
                <h3 className="font-semibold text-sm uppercase tracking-wide text-slate mb-3">Proje Bilgileri</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {[
                    ["Durum", project.status],
                    ["Adım", project.current_step],
                    ["Site Tipi", project.website_type || "appointment"],
                    ["Domain Tipi", project.domain_type || "—"],
                    ["İstenen Domain", project.desired_domain || "—"],
                    ["Alınan Domain", project.purchased_domain || "—"],
                    ["Vercel ID", project.vercel_project_id || "—"],
                    ["Canlı URL", project.live_url || "—"],
                    ["Admin Şifresi", project.extracted_info?.admin_panel_key || "—"],
                    ["Adres", project.address || "—"],
                    ["Telefon", project.phone || "—"],
                    ["Şehir", project.city || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-slate">{k}</dt>
                      <dd className="font-medium break-all">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Fatura Kayıtları */}
              {billing.length > 0 && (
                <section>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-slate mb-3">Fatura Kayıtları</h3>
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate text-xs uppercase">
                      <tr>
                        <th className="pb-1">Tutar</th>
                        <th className="pb-1">Durum</th>
                        <th className="pb-1">Not</th>
                        <th className="pb-1">Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.map((b, i) => (
                        <tr key={i} className="border-t border-ink/5">
                          <td className="py-1.5 font-medium">€{(b.amount || 0).toFixed(2)}</td>
                          <td className="py-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              b.status === "completed" ? "bg-green-100 text-green-700" :
                              b.status === "refunded" || b.status === "failed" ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-1.5 text-slate text-xs">{b.notes || "—"}</td>
                          <td className="py-1.5 text-slate">
                            {b.created_at ? new Date(b.created_at).toLocaleDateString("de-DE") :
                             b.due_date ? `Due: ${new Date(b.due_date).toLocaleDateString("de-DE")}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Eylemler */}
              {!result && (
                <section className="space-y-2 pt-2 border-t border-ink/10">
                  {!isCancelled && (
                    <button
                      onClick={triggerPipeline}
                      disabled={!!action}
                      className="w-full py-2 rounded-xl border-2 border-accent text-accent font-semibold text-sm hover:bg-accent/10 disabled:opacity-50 transition"
                    >
                      {action === "pipeline"
                        ? "Başlatılıyor…"
                        : project.current_step === "form_submitted"
                          ? "▶ Pipeline Başlat"
                          : isDone
                            ? "🔄 Yeniden Derle & Yayınla"
                            : "🔄 Yeniden Başlat (form_submitted'e sıfırla)"}
                    </button>
                  )}

                  {/* Fiyat Listesi Tarama */}
                  {isDone && (
                    <div>
                      <button
                        onClick={() => setShowPriceScan((p) => !p)}
                        disabled={!!action}
                        className="w-full py-2 rounded-xl border-2 border-emerald-500 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 disabled:opacity-50 transition"
                      >
                        💶 Fiyat Listesini KI ile Tara
                      </button>
                      {showPriceScan && (
                        <div className="mt-2 flex gap-2">
                          <input
                            value={priceScanUrl}
                            onChange={(e) => setPriceScanUrl(e.target.value)}
                            placeholder="Fiyat listesi fotoğrafı URL'si"
                            className="flex-1 border border-ink/20 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                          />
                          <button
                            onClick={triggerPriceScan}
                            disabled={!priceScanUrl.trim() || !!action}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {action === "pricescan" ? "Taranıyor…" : "Tara"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* KI Logo */}
                  {isDone && (
                    <button
                      onClick={generateLogo}
                      disabled={!!action}
                      className="w-full py-2 rounded-xl border-2 border-purple-500 text-purple-700 font-semibold text-sm hover:bg-purple-50 disabled:opacity-50 transition"
                    >
                      {action === "logo" ? "KI logo oluşturuyor…" : "🎨 KI ile Logo Oluştur"}
                    </button>
                  )}

                  {/* Domain Al & Taşı */}
                  {isDone && (
                    <div>
                      <button
                        onClick={() => { setShowDomain((p) => !p); setDomainCheck(null); }}
                        disabled={!!action}
                        className="w-full py-2 rounded-xl border-2 border-indigo-500 text-indigo-700 font-semibold text-sm hover:bg-indigo-50 disabled:opacity-50 transition"
                      >
                        🌐 Yeni Domain Al & Yayınla
                      </button>
                      {showDomain && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-2">
                            <input
                              value={domainInput}
                              onChange={(e) => { setDomainInput(e.target.value); setDomainCheck(null); }}
                              onKeyDown={(e) => e.key === "Enter" && checkDomain()}
                              placeholder="örn: mein-salon-berlin.de"
                              className="flex-1 border border-ink/20 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={checkDomain}
                              disabled={!domainInput.trim() || !!action}
                              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {action === "domaincheck" ? "Kontrol…" : "Kontrol Et"}
                            </button>
                          </div>
                          {domainCheck && (
                            domainCheck.available ? (
                              <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-2">
                                <p className="text-sm text-green-800">
                                  ✅ <strong>{domainCheck.domain}</strong> müsait!
                                </p>
                                <button
                                  onClick={buyDomain}
                                  disabled={!!action}
                                  className="w-full py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                                >
                                  {action === "domainbuy" ? "Satın alınıyor & taşınıyor…" : "🛒 Satın Al & Siteyi Taşı"}
                                </button>
                              </div>
                            ) : (
                              <p className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                                ❌ <strong>{domainCheck.domain}</strong> maalesef alınmış. Başka bir isim deneyin.
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!isDone && !isCancelled && (
                      <button
                        onClick={terminate}
                        disabled={!!action}
                        className="flex-1 py-2 rounded-xl border-2 border-amber-500 text-amber-700 font-semibold text-sm hover:bg-amber-50 disabled:opacity-50 transition"
                      >
                        {action === "terminating" ? "İptal ediliyor…" : "⏹ Sonlandır"}
                      </button>
                    )}
                    <button
                      onClick={remove}
                      disabled={!!action}
                      className="flex-1 py-2 rounded-xl border-2 border-red-500 text-red-700 font-semibold text-sm hover:bg-red-50 disabled:opacity-50 transition"
                    >
                      {action === "removing" ? "Kaldırılıyor…" : "🗑 Kaldır"}
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "../../components/Logo";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import LogoutButton from "../../components/LogoutButton";
import { useLang } from "../../lib/i18n";

const STATUS_LABELS = {
  pending: { label: "Ausstehend", color: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "In Bearbeitung", color: "bg-blue-100 text-blue-800" },
  waiting_user: { label: "Wartet auf Sie", color: "bg-purple-100 text-purple-800" },
  completed: { label: "Live", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Storniert", color: "bg-gray-100 text-gray-600" },
  failed: { label: "Fehler", color: "bg-red-100 text-red-700" },
};

// Süreç çizelgesi (müşteri görünümü — kompakt)
const PIPELINE_STEPS = [
  { key: "form_submitted",     label: "Angaben erhalten" },
  { key: "pipeline_queued",    label: "In Warteschlange" },
  { key: "content_generation", label: "Inhalte werden erstellt" },
  { key: "assembling",         label: "Website wird gebaut" },
  { key: "domain_check",       label: "Webadresse" },
  { key: "deployment",         label: "Veröffentlichung" },
  { key: "done",               label: "Live" },
];

function MiniTimeline({ currentStep, status }) {
  if (status === "cancelled" || status === "failed") return null;
  const idx = PIPELINE_STEPS.findIndex(s => s.key === currentStep);
  if (idx < 0 && status !== "completed") return null;
  const activeIdx = status === "completed" ? PIPELINE_STEPS.length - 1 : idx;
  const activeLabel = PIPELINE_STEPS[activeIdx]?.label || "";

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5">
        {PIPELINE_STEPS.map((s, i) => (
          <div key={s.key} className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < activeIdx ? "bg-green-500" :
            i === activeIdx ? (status === "completed" ? "bg-green-500" : "bg-accent animate-pulse") :
            "bg-gray-200"
          }`} />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-slate">
        {status === "completed" ? "✓ Ihre Website ist live!" : `${activeLabel}…`}
      </p>
    </div>
  );
}

export default function DashboardFull({ user }) {
  const { tx } = useLang();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewFlow, setShowNewFlow] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg("");
    if (pwForm.next !== pwForm.confirm) { setPwMsg("⚠ Passwörter stimmen nicht überein."); return; }
    if (pwForm.next.length < 8) { setPwMsg("⚠ Mindestens 8 Zeichen."); return; }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const d = await res.json();
      if (!res.ok) { setPwMsg("⚠ " + (d.error || "Fehler.")); return; }
      setPwMsg("✓ Passwort geändert.");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (e) { setPwMsg("⚠ " + e.message); }
    finally { setPwLoading(false); }
  }

  useEffect(() => {
    fetch("/api/projects/my")
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = projects.filter(p => p.status === "completed").length;
  const pendingCount = projects.filter(p => ["pending", "in_progress", "waiting_user"].includes(p.status)).length;

  if (showNewFlow) {
    return <NewSiteFlow user={user} onBack={() => setShowNewFlow(false)} onCreated={(p) => { setProjects(prev => [p, ...prev]); setShowNewFlow(false); }} />;
  }

  return (
    <div className="min-h-screen bg-cream font-body">
      {/* TOPBAR */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <Link href="/"><Logo size={32} showText /></Link>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <span className="hidden sm:block text-sm text-slate">{user?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: tx.dash_active || "Aktive Websites", value: activeCount, icon: "🌐" },
            { label: tx.dash_pending || "In Bearbeitung", value: pendingCount, icon: "⏳" },
            { label: tx.dash_total || "Gesamt", value: projects.length, icon: "📁" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-ink">{s.value}</div>
              <div className="text-slate text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* HEADER ROW */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">{tx.my_sites || "Meine Websites"}</h1>
          <button onClick={() => setShowNewFlow(true)}
            className="bg-accent hover:bg-accentdark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
            <span>+</span> {tx.new_site || "Neue Website"}
          </button>
        </div>

        {/* PROJECTS LIST */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">✂</div>
            <h2 className="font-display text-xl font-semibold text-ink mb-3">{tx.no_sites_yet || "Noch keine Website"}</h2>
            <p className="text-slate mb-6">{tx.no_sites_sub || "Erstellen Sie Ihre erste professionelle Salon-Website."}</p>
            <button onClick={() => setShowNewFlow(true)}
              className="bg-accent hover:bg-accentdark text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              {tx.create_first || "Erste Website erstellen"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(p => {
              const statusInfo = STATUS_LABELS[p.status] || STATUS_LABELS.pending;
              const needsRenewal = p.expires_at && new Date(p.expires_at) < new Date(Date.now() + 30 * 24 * 3600 * 1000);
              return (
                <div key={p.project_id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt="logo" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-2xl shrink-0">✂</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-ink truncate">{p.salon_name || tx.unnamed_salon || "Unbenannter Salon"}</h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusInfo.color}`}>{statusInfo.label}</span>
                      </div>
                      <p className="text-slate text-sm mt-0.5">{p.city || p.address || "—"}</p>
                      <MiniTimeline currentStep={p.current_step} status={p.status} />
                      {p.live_url && (
                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                            className="text-accent text-sm hover:underline">{p.live_url}</a>
                          <a href={`${p.live_url.replace(/\/$/, "")}/admin`} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-ink/5 text-ink hover:bg-ink/10 transition-colors">
                            ⚙️ {tx.site_admin || "Website verwalten"}
                          </a>
                        </div>
                      )}
                      {needsRenewal && p.expires_at && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 flex items-center justify-between gap-3">
                          <span className="text-yellow-700 text-xs">
                            ⚠ {tx.expires || "Läuft ab am"}: {new Date(p.expires_at).toLocaleDateString("de-DE")}
                          </span>
                          <button className="text-xs font-semibold text-accent hover:underline">{tx.renew || "Verlängern"}</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ŞİFRE DEĞİŞTİR */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">{tx.change_pw_title || "Passwort ändern"}</h2>
          <form onSubmit={changePassword} className="bg-white rounded-2xl shadow-sm p-5 max-w-sm space-y-3">
            <input type="password" required placeholder={tx.change_pw_current || "Aktuelles Passwort"}
              value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <input type="password" required placeholder={tx.change_pw_new || "Neues Passwort (min. 8 Zeichen)"}
              value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <input type="password" required placeholder={tx.change_pw_confirm || "Neues Passwort wiederholen"}
              value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
            {pwMsg && <p className={`text-sm ${pwMsg.startsWith("✓") ? "text-green-700" : "text-red-600"}`}>{pwMsg}</p>}
            <button disabled={pwLoading}
              className="bg-accent hover:bg-accentdark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {pwLoading ? "…" : (tx.change_pw_btn || "Passwort ändern")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

const EMPTY_FORM = {
  business_type: process.env.NEXT_PUBLIC_BRAND === "nagelstudio" ? "nagelstudio" : "friseur",
  salon_name: "",
  address: "",
  phone: "",
  email: "",
  description: "",
  hours_weekdays: "09:00 - 18:00",
  hours_saturday: "09:00 - 14:00",
  hours_sunday: "geschlossen",
  domain_type: "subdomain",
  desired_domain: "",
  template_id: "", // boş = otomatik seçim
};

const BUSINESS_TYPES = [
  { id: "friseur", icon: "✂️", name: "Friseursalon", desc: "Haarschnitt, Färben, Styling — mit Online-Terminbuchung." },
  { id: "nagelstudio", icon: "💅", name: "Nagelstudio", desc: "Maniküre, Pediküre, Gel & Acryl — mit Online-Terminbuchung." },
];

// Tasarım kataloğu — renk örnekleri her template'in paletini yansıtır
const TEMPLATES = [
  { id: "", name: "Automatisch", desc: "Wir wählen das passende Design für Ihren Salon.", colors: ["#ff6b35", "#1a1f2b", "#faf7f2"], badge: "Empfohlen" },
  { id: "appointment_01", name: "Modern & Feminin", desc: "Helle Rosé-Creme-Töne, elegant. Ideal für Damensalons & Beauty.", colors: ["#c9776b", "#4a3733", "#f7efe9"] },
  { id: "appointment_02", name: "Luxus & Premium", desc: "Goldakzente, Serifenschrift. Für gehobene Salons & Barbershops.", colors: ["#b08d57", "#2b2420", "#f5f0e8"] },
  { id: "appointment_03", name: "Barbershop Klassik", desc: "Dunkelblau-Weiß, Vintage-Ästhetik. Herrenfokus.", colors: ["#1e2a3a", "#c05a3c", "#f2efe9"] },
  { id: "appointment_04", name: "Nordisch Natürlich", desc: "Grün-Beige, organisch, viel Weißraum. Für naturnahe Salons.", colors: ["#7a8b6f", "#3d3a33", "#f6f4ee"] },
  { id: "appointment_05", name: "Minimal Schwarz-Weiß", desc: "Pur & minimalistisch, starke Typografie. Für moderne Salons.", colors: ["#1a1a1a", "#666666", "#ffffff"] },
];

function NewSiteFlow({ user, onBack, onCreated }) {
  const { tx } = useLang();
  const [step, setStep] = useState(1);
  const [planId, setPlanId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [priceFiles, setPriceFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/pricing").then(r => r.json()).then(d => setPlans(d.plans || []));
  }, []);

  function set(key, value) {
    setForm(p => ({ ...p, [key]: value }));
  }

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload fehlgeschlagen.");
    return data.url;
  }

  async function submitAll() {
    if (!form.salon_name.trim() || !form.address.trim()) {
      setError("Salonname und Adresse sind erforderlich.");
      return;
    }
    if (form.domain_type === "own" && !form.desired_domain.trim()) {
      setError("Bitte Wunschdomain angeben oder kostenlose Subdomain wählen.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // 1. Görselleri yükle
      let logo_url = "";
      const price_list_urls = [];
      if (logoFile) {
        setProgress(tx.uploading_logo || "Logo wird hochgeladen…");
        logo_url = await uploadFile(logoFile);
      }
      for (let i = 0; i < priceFiles.length; i++) {
        setProgress(`${tx.uploading_price || "Preisliste wird hochgeladen"} (${i + 1}/${priceFiles.length})…`);
        price_list_urls.push(await uploadFile(priceFiles[i]));
      }

      // 2. Projeyi oluştur
      setProgress(tx.creating || "Projekt wird erstellt…");
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          salon_name: form.salon_name,
          address: form.address,
          phone: form.phone,
          email: form.email,
          description: form.description,
          opening_hours: {
            "Mo-Fr": form.hours_weekdays,
            "Sa": form.hours_saturday,
            "So": form.hours_sunday,
          },
          domain_type: form.domain_type,
          desired_domain: form.desired_domain,
          logo_url,
          price_list_urls,
          template_id: form.template_id,
          business_type: form.business_type,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Fehler."); return; }
      setProjectId(data.project_id);
      setStep(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
      setProgress("");
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent bg-white";

  return (
    <div className="min-h-screen bg-cream font-body">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <button onClick={onBack} className="text-slate hover:text-ink text-sm flex items-center gap-1">
            ← {tx.back || "Zurück"}
          </button>
          <h1 className="font-display font-semibold text-ink ml-4">{tx.new_site || "Neue Website"}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* STEP INDICATOR */}
        <div className="flex items-center gap-4 mb-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? "bg-accent text-white" : "bg-gray-200 text-gray-500"}`}>{s}</div>
              {s < 4 && <div className={`h-0.5 w-10 transition-colors ${step > s ? "bg-accent" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* STEP 1: INFO */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-ink mb-3">{tx.step1_title || "Wie es funktioniert"}</h2>
            <p className="text-slate mb-6">{tx.new_site_info || "Füllen Sie das Formular direkt hier im Portal aus — oder senden Sie uns Ihre Infos alternativ über unseren Telegram-Bot. Ihre Website wird automatisch erstellt."}</p>
            <div className="space-y-4 mb-8">
              {[
                { icon: "📋", text: tx.new_step1 || "Plan wählen und Salon-Infos im Formular eintragen" },
                { icon: "🖼", text: tx.new_step2 || "Logo und Preisliste hochladen (optional) — kein Logo? Unsere KI erstellt eines" },
                { icon: "⚡", text: tx.new_step3 || "Unser System erstellt Ihre Website automatisch" },
                { icon: "🌐", text: tx.new_step4 || "Ihre Website geht live — Kunden können Termine buchen" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 flex items-start gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-ink">{item.text}</span>
                </div>
              ))}
            </div>
            <p className="text-slate text-xs mb-4 text-center">
              {tx.telegram_alt || "Alternativ können Sie alles auch per Telegram-Bot erledigen."}
            </p>
            <button onClick={() => setStep(2)} className="w-full bg-accent hover:bg-accentdark text-white font-semibold py-3 rounded-xl transition-colors">
              {tx.continue || "Weiter"} →
            </button>
          </div>
        )}

        {/* STEP 2: PLAN SELECTION */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-ink mb-6">{tx.choose_plan || "Plan wählen"}</h2>
            {plans.length === 0 ? (
              <div className="text-center py-8 text-slate">Laden…</div>
            ) : (
              <div className="space-y-4 mb-6">
                {plans.map(plan => (
                  <div key={plan.id} onClick={() => setPlanId(plan.id)}
                    className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${planId === plan.id ? "border-accent bg-accent/5" : "border-gray-200 bg-white hover:border-accent/40"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-display font-bold text-ink text-lg">{plan.name}</span>
                        {plan.is_featured && <span className="ml-2 text-xs bg-accent text-white px-2 py-0.5 rounded-full">Beliebt</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-ink">€{plan.price}</span>
                        <span className="text-slate text-sm">/Jahr</span>
                      </div>
                    </div>
                    <ul className="space-y-1 mt-3">
                      {(plan.features || []).slice(0, 3).map((f, i) => (
                        <li key={i} className="text-slate text-sm flex items-center gap-2">
                          <span className="text-accent">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-slate py-3 rounded-xl hover:bg-gray-50 transition-colors">← {tx.back || "Zurück"}</button>
              <button onClick={() => setStep(3)} disabled={!planId}
                className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
                {tx.continue || "Weiter"} →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SALON FORM */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-ink mb-6">{tx.salon_info || "Salon-Informationen"}</h2>
            <div className="space-y-4 mb-6">
              {/* İŞLETME TİPİ */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="text-sm font-medium text-ink mb-3">{tx.business_type || "Art des Betriebs"}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map(b => (
                    <button key={b.id} type="button" onClick={() => set("business_type", b.id)}
                      className={`text-left rounded-xl border-2 p-3.5 transition-all ${form.business_type === b.id ? "border-accent bg-accent/5" : "border-gray-100 hover:border-accent/40"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{b.icon}</span>
                        <span className="text-sm font-semibold text-ink">{b.name}</span>
                        {form.business_type === b.id && <span className="ml-auto text-accent text-sm">✓</span>}
                      </div>
                      <p className="text-xs text-slate leading-snug">{b.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate mb-1.5">{tx.salon_name || "Salonname"} *</label>
                <input type="text" value={form.salon_name} onChange={e => set("salon_name", e.target.value)}
                  placeholder="z.B. Salon Schnittwerk" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-1.5">{tx.address || "Adresse"} *</label>
                <input type="text" value={form.address} onChange={e => set("address", e.target.value)}
                  placeholder="Musterstraße 12, 10115 Berlin" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">{tx.phone || "Telefon"}</label>
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                    placeholder="+49 30 1234567" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">{tx.email || "E-Mail"}</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder="info@meinsalon.de" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-1.5">{tx.description || "Beschreibung (optional)"}</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
                  placeholder="Erzählen Sie kurz über Ihren Salon: Spezialitäten, Team, Atmosphäre…" className={inputCls} />
              </div>

              {/* ÖFFNUNGSZEITEN */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="text-sm font-medium text-ink mb-3">{tx.opening_hours || "Öffnungszeiten"}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ["Mo–Fr", "hours_weekdays"],
                    ["Samstag", "hours_saturday"],
                    ["Sonntag", "hours_sunday"],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-xs text-slate mb-1">{label}</label>
                      <input type="text" value={form[key]} onChange={e => set(key, e.target.value)} className={inputCls} />
                    </div>
                  ))}
                </div>
              </div>

              {/* DESIGN / TEMPLATE */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="text-sm font-medium text-ink mb-1">{tx.design_choice || "Design wählen"}</div>
                <p className="text-xs text-slate mb-3">{tx.design_hint || "Nicht sicher? Lassen Sie uns automatisch wählen."}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TEMPLATES.map(t => (
                    <button key={t.id} type="button" onClick={() => set("template_id", t.id)}
                      className={`text-left rounded-xl border-2 p-3 transition-all ${form.template_id === t.id ? "border-accent bg-accent/5" : "border-gray-100 hover:border-accent/40"}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {t.colors.map((c, i) => (
                              <span key={i} className="inline-block h-4 w-4 rounded-full border border-white" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-ink">{t.name}</span>
                        </div>
                        {t.badge && <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded-full">{t.badge}</span>}
                        {form.template_id === t.id && !t.badge && <span className="text-accent text-sm">✓</span>}
                      </div>
                      <p className="text-xs text-slate leading-snug">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* DOMAIN */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="text-sm font-medium text-ink mb-3">{tx.domain_choice || "Webadresse"}</div>
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <input type="radio" name="domain_type" checked={form.domain_type === "subdomain"}
                    onChange={() => set("domain_type", "subdomain")} className="accent-accent" />
                  <span className="text-sm text-ink">{tx.free_subdomain || "Kostenlose Subdomain"} <span className="text-slate text-xs">(ihr-salon.friseurdeutschland.de)</span></span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="domain_type" checked={form.domain_type === "own"}
                    onChange={() => set("domain_type", "own")} className="accent-accent" />
                  <span className="text-sm text-ink">{tx.own_domain || "Eigene Wunschdomain"} <span className="text-slate text-xs">(z.B. mein-salon.de)</span></span>
                </label>
                {form.domain_type === "own" && (
                  <input type="text" value={form.desired_domain} onChange={e => set("desired_domain", e.target.value)}
                    placeholder="mein-salon.de" className={`${inputCls} mt-3`} />
                )}
              </div>

              {/* LOGO UPLOAD */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="text-sm font-medium text-ink mb-1">{tx.logo_upload || "Logo (optional)"}</div>
                <p className="text-xs text-slate mb-3">{tx.logo_hint || "Kein Logo? Kein Problem — unsere KI erstellt automatisch eines für Sie."}</p>
                <input type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={e => setLogoFile(e.target.files?.[0] || null)}
                  className="text-sm text-slate file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-accent/10 file:text-accent file:text-sm file:font-medium file:cursor-pointer" />
                {logoFile && <p className="text-xs text-green-600 mt-2">✓ {logoFile.name}</p>}
              </div>

              {/* PREISLISTE UPLOAD */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="text-sm font-medium text-ink mb-1">{tx.price_upload || "Preisliste als Foto (optional)"}</div>
                <p className="text-xs text-slate mb-3">{tx.price_hint || "Unsere KI liest Ihre Preisliste und trägt alle Dienstleistungen automatisch auf der Website ein."}</p>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                  onChange={e => setPriceFiles(Array.from(e.target.files || []).slice(0, 5))}
                  className="text-sm text-slate file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-accent/10 file:text-accent file:text-sm file:font-medium file:cursor-pointer" />
                {priceFiles.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">✓ {priceFiles.length} {tx.files_selected || "Datei(en) ausgewählt"}</p>
                )}
              </div>
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            {progress && <p className="text-accent text-sm mb-4 text-center">{progress}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} disabled={submitting}
                className="flex-1 border border-gray-200 text-slate py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60">← {tx.back || "Zurück"}</button>
              <button onClick={submitAll} disabled={submitting}
                className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
                {submitting ? (tx.creating || "Erstelle…") : (tx.create_project || "Projekt erstellen")}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DONE */}
        {step === 4 && (
          <div className="text-center">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="font-display text-2xl font-bold text-ink mb-3">{tx.project_created || "Projekt erstellt!"}</h2>
            <p className="text-slate mb-6">{tx.project_created_sub2 || "Ihre Angaben sind eingegangen. Wir erstellen jetzt Ihre Website — Sie erhalten den Link, sobald sie live ist."}</p>
            <div className="bg-white rounded-2xl p-6 text-left mb-6 space-y-3">
              <p className="text-sm text-ink font-medium">{tx.next_steps || "So geht es weiter:"}</p>
              <p className="text-sm text-slate">1. {tx.done_step1 || "Unser System erstellt Ihre Website automatisch"}</p>
              <p className="text-sm text-slate">2. {tx.done_step2 || "Logo & Preisliste werden übernommen (bzw. per KI erstellt)"}</p>
              <p className="text-sm text-slate">3. {tx.done_step3 || "Sie sehen den Status jederzeit hier im Dashboard"}</p>
            </div>
            <button onClick={() => onCreated({ project_id: projectId, salon_name: form.salon_name, status: "pending" })}
              className="w-full bg-accent hover:bg-accentdark text-white font-semibold py-3 rounded-xl transition-colors">
              {tx.back_to_dashboard || "Zum Dashboard"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

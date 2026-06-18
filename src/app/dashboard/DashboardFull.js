"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "../../components/Logo";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import LogoutButton from "../../components/LogoutButton";
import { useLang } from "../../lib/i18n";

const STATUS_LABELS = {
  pending: { label: "Ausstehend", color: "bg-yellow-100 text-yellow-800" },
  info_submitted: { label: "Info eingereicht", color: "bg-blue-100 text-blue-800" },
  building: { label: "In Bearbeitung", color: "bg-purple-100 text-purple-800" },
  completed: { label: "Live", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Storniert", color: "bg-gray-100 text-gray-600" },
};

export default function DashboardFull({ user }) {
  const { tx } = useLang();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewFlow, setShowNewFlow] = useState(false);

  useEffect(() => {
    fetch("/api/projects/my")
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = projects.filter(p => p.status === "completed").length;
  const pendingCount = projects.filter(p => ["pending", "info_submitted", "building"].includes(p.status)).length;

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
                      {p.live_url && (
                        <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                          className="text-accent text-sm hover:underline mt-1 inline-block">{p.live_url}</a>
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
      </main>
    </div>
  );
}

function NewSiteFlow({ user, onBack, onCreated }) {
  const { tx } = useLang();
  const [step, setStep] = useState(1);
  const [planId, setPlanId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/pricing").then(r => r.json()).then(d => setPlans(d.plans || []));
  }, []);

  async function createProject() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Fehler."); return; }
      setProjectId(data.project_id);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  }

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
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? "bg-accent text-white" : "bg-gray-200 text-gray-500"}`}>{s}</div>
              {s < 3 && <div className={`h-0.5 w-12 transition-colors ${step > s ? "bg-accent" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* STEP 1: INFO */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-ink mb-3">{tx.step1_title || "Wie es funktioniert"}</h2>
            <p className="text-slate mb-6">{tx.new_site_info || "Nach der Registrierung senden Sie uns Ihre Salon-Informationen über unseren Telegram-Bot. Wir erstellen dann Ihre Website innerhalb weniger Tage."}</p>
            <div className="space-y-4 mb-8">
              {[
                { icon: "💬", text: tx.new_step1 || "Wählen Sie einen Plan und registrieren Sie Ihr Projekt" },
                { icon: "📩", text: tx.new_step2 || "Senden Sie Salon-Infos per Telegram (Name, Adresse, Fotos, Öffnungszeiten)" },
                { icon: "⚡", text: tx.new_step3 || "Unser System erstellt Ihre Website automatisch" },
                { icon: "🌐", text: tx.new_step4 || "Ihre Website geht live — Kunden können Termine buchen" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 flex items-start gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-ink">{item.text}</span>
                </div>
              ))}
            </div>
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
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-slate py-3 rounded-xl hover:bg-gray-50 transition-colors">← {tx.back || "Zurück"}</button>
              <button onClick={createProject} disabled={!planId || submitting}
                className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
                {submitting ? (tx.creating || "Erstelle…") : (tx.create_project || "Projekt erstellen")}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DONE */}
        {step === 3 && (
          <div className="text-center">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="font-display text-2xl font-bold text-ink mb-3">{tx.project_created || "Projekt erstellt!"}</h2>
            <p className="text-slate mb-2">{tx.project_created_sub || "Ihr Projekt wurde angelegt. Nächster Schritt:"}</p>
            <div className="bg-white rounded-2xl p-6 text-left mb-6 space-y-3">
              <p className="text-sm text-ink font-medium">{tx.next_steps || "Nächste Schritte:"}</p>
              <p className="text-sm text-slate">1. {tx.next_step1 || "Kontaktieren Sie uns über Telegram mit Ihren Salon-Infos"}</p>
              <p className="text-sm text-slate">2. {tx.next_step2 || "Senden Sie Fotos, Logo, Öffnungszeiten und Preisliste"}</p>
              <p className="text-sm text-slate">3. {tx.next_step3 || "Wir erstellen Ihre Website und Sie erhalten den Link"}</p>
            </div>
            <button onClick={() => onCreated({ project_id: projectId, status: "pending" })}
              className="w-full bg-accent hover:bg-accentdark text-white font-semibold py-3 rounded-xl transition-colors">
              {tx.back_to_dashboard || "Zum Dashboard"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "../../../components/Toast";

const STATUS_OPTS = ["all","pending","info_submitted","building","completed","cancelled"];
const STATUS_COLORS = {
  pending:        "bg-yellow-100 text-yellow-800",
  info_submitted: "bg-blue-100 text-blue-800",
  building:       "bg-purple-100 text-purple-800",
  completed:      "bg-green-100 text-green-800",
  cancelled:      "bg-gray-100 text-gray-600",
};
const PAGE_SIZE = 20;

export default function AdminProjects() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(null);
  const [tool, setTool] = useState(null); // "price" | "logo" | "domain"

  useEffect(() => {
    fetch("/api/admin/projects")
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (filter !== "all" && p.status !== filter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(p.salon_name?.toLowerCase().includes(s) || p.city?.toLowerCase().includes(s) || p.project_id?.includes(s) || p.address?.toLowerCase().includes(s))) return false;
      }
      if (dateFrom && p.created_at < dateFrom) return false;
      if (dateTo && p.created_at > dateTo + "T23:59:59") return false;
      return true;
    });
  }, [projects, filter, search, dateFrom, dateTo]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filter, search, dateFrom, dateTo]);

  async function patchStatus(projectId, status) {
    const res = await fetch(`/api/admin/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast("Fehler beim Aktualisieren.", "error"); return; }
    setProjects(prev => prev.map(p => p.project_id === projectId ? { ...p, status } : p));
    if (selected?.project_id === projectId) setSelected(p => ({ ...p, status }));
    toast("Status aktualisiert.", "success");
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const payload = {
        status: editing.status,
        live_url: editing.live_url || null,
        city: editing.city || null,
        expires_at: editing.expires_at || null,
      };
      const res = await fetch(`/api/admin/projects/${editing.project_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { toast("Fehler.", "error"); return; }
      setProjects(prev => prev.map(p => p.project_id === editing.project_id ? { ...p, ...payload } : p));
      setSelected(p => p ? { ...p, ...payload } : null);
      setEditing(null);
      toast("Projekt aktualisiert.", "success");
    } finally {
      setSaving(false);
    }
  }

  async function triggerPipeline(projectId) {
    setTriggerLoading(projectId);
    try {
      const res = await fetch("/api/admin/trigger-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (!res.ok) { toast("Pipeline-Fehler.", "error"); return; }
      toast("Pipeline gestartet.", "success");
    } finally {
      setTriggerLoading(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Projekte</h1>
        <span className="text-slate text-sm">{filtered.length} Ergebnisse</span>
      </div>

      {/* FILTER ROW */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Salon, Stadt, Projekt-ID…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
          <div className="flex gap-2 items-center text-sm text-slate">
            <span>Von</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <span>Bis</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-accent hover:underline text-xs">Löschen</button>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-xl border transition-colors ${filter === s ? "bg-ink text-white border-ink" : "bg-white text-slate border-gray-200 hover:border-gray-300"}`}>
              {s === "all" ? "Alle" : s}
              {s !== "all" && <span className="ml-1 text-xs opacity-70">({projects.filter(p => p.status === s).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-slate text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Salon</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Stadt</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Erstellt</th>
                  <th className="text-right px-5 py-3 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map(p => (
                  <tr key={p.project_id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelected(p)} className="font-medium text-ink hover:text-accent text-left">
                        {p.salon_name || "Unbenannt"}
                      </button>
                      <div className="text-xs text-slate/60 font-mono mt-0.5">{p.project_id?.slice(0,8)}…</div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-slate">{p.city || "—"}</td>
                    <td className="px-5 py-3.5">
                      <select value={p.status}
                        onChange={e => patchStatus(p.project_id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {["pending","info_submitted","building","completed","cancelled"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-slate text-xs">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("de-DE") : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelected(p); setEditing({ ...p }); }}
                          className="text-xs text-accent hover:underline">Bearbeiten</button>
                        {p.live_url && (
                          <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-slate hover:text-ink">↗</a>
                        )}
                        <button onClick={() => triggerPipeline(p.project_id)}
                          disabled={triggerLoading === p.project_id}
                          className="text-xs bg-accent/10 hover:bg-accent/20 text-accent px-2.5 py-1 rounded-lg transition-colors disabled:opacity-60">
                          {triggerLoading === p.project_id ? "…" : "▶"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-slate">Keine Projekte gefunden</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">←</button>
              {Array.from({ length: pageCount }, (_, i) => i + 1)
                .filter(n => n === 1 || n === pageCount || Math.abs(n - page) <= 1)
                .reduce((acc, n, i, arr) => {
                  if (i > 0 && n - arr[i-1] > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) => n === "…"
                  ? <span key={i} className="px-2 text-slate">…</span>
                  : <button key={n} onClick={() => setPage(n)}
                      className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${page === n ? "bg-ink text-white border-ink" : "border-gray-200 hover:bg-gray-50"}`}>
                      {n}
                    </button>
                )}
              <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">→</button>
            </div>
          )}
        </>
      )}

      {/* DETAIL / EDIT MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setSelected(null); setEditing(null); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-ink">{selected.salon_name || "Projektdetails"}</h2>
              <button onClick={() => { setSelected(null); setEditing(null); }}
                className="text-slate hover:text-ink text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
            </div>

            {editing ? (
              <div className="space-y-4">
                {[
                  ["Status", "status", "select"],
                  ["Live URL", "live_url", "url"],
                  ["Stadt", "city", "text"],
                  ["Läuft ab am", "expires_at", "date"],
                ].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate mb-1.5">{label}</label>
                    {type === "select" ? (
                      <select value={editing[key] || ""} onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent">
                        {["pending","info_submitted","building","completed","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <input type={type === "date" ? "date" : "text"} value={editing[key] || ""}
                        onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
                    )}
                  </div>
                ))}
                <div className="flex gap-3 mt-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
                    {saving ? "Speichert…" : "Speichern"}
                  </button>
                  <button onClick={() => setEditing(null)} className="flex-1 border border-gray-200 text-slate py-2.5 rounded-xl hover:bg-gray-50 text-sm">Abbrechen</button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2.5 text-sm mb-5">
                  {[
                    ["Projekt ID", selected.project_id],
                    ["Status", selected.status],
                    ["Stadt", selected.city || "—"],
                    ["Adresse", selected.address || "—"],
                    ["Live URL", selected.live_url || "—"],
                    ["Erstellt", selected.created_at ? new Date(selected.created_at).toLocaleString("de-DE") : "—"],
                    ["Läuft ab", selected.expires_at ? new Date(selected.expires_at).toLocaleDateString("de-DE") : "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-slate w-28 shrink-0 text-xs">{k}</span>
                      <span className="text-ink font-medium text-xs break-all">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setEditing({ ...selected })}
                    className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                    Bearbeiten
                  </button>
                  <button onClick={() => triggerPipeline(selected.project_id)} disabled={triggerLoading === selected.project_id}
                    className="flex-1 border border-gray-200 text-ink py-2.5 rounded-xl hover:bg-gray-50 text-sm transition-colors disabled:opacity-60">
                    {triggerLoading === selected.project_id ? "Startet…" : "▶ Pipeline"}
                  </button>
                </div>

                {/* WERKZEUGE */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-xs text-slate mb-2 font-medium uppercase tracking-wide">Werkzeuge</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setTool("price")}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-100 hover:border-accent/30 hover:bg-accent/5 transition-all text-xs text-ink">
                      <span className="text-lg">💶</span> Preisliste
                    </button>
                    <button onClick={() => setTool("logo")}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-100 hover:border-accent/30 hover:bg-accent/5 transition-all text-xs text-ink">
                      <span className="text-lg">🎨</span> KI-Logo
                    </button>
                    <button onClick={() => setTool("domain")}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-100 hover:border-accent/30 hover:bg-accent/5 transition-all text-xs text-ink">
                      <span className="text-lg">🌐</span> Domain
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TOOL MODALS */}
      {selected && tool === "price" && (
        <PriceScanModal project={selected} toast={toast} onClose={() => setTool(null)} />
      )}
      {selected && tool === "logo" && (
        <LogoGenerateModal project={selected} toast={toast} onClose={() => setTool(null)} />
      )}
      {selected && tool === "domain" && (
        <DomainModal project={selected} toast={toast}
          onClose={() => setTool(null)}
          onMoved={(domain) => {
            setProjects(prev => prev.map(p => p.project_id === selected.project_id ? { ...p, live_url: `https://${domain}` } : p));
          }} />
      )}
    </div>
  );
}

function ToolModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="text-slate hover:text-ink text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PriceScanModal({ project, toast, onClose }) {
  const [imageUrl, setImageUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  async function scan() {
    if (!imageUrl.startsWith("http")) { toast("Gültige Bild-URL erforderlich.", "error"); return; }
    setScanning(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/price-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: project.project_id, image_url: imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error || "Scan fehlgeschlagen.", "error"); return; }
      setResult(data);
      toast(`${data.total} Dienstleistungen übernommen.`, "success");
    } finally {
      setScanning(false);
    }
  }

  return (
    <ToolModal title={`Preisliste scannen: ${project.salon_name || ""}`} onClose={onClose}>
      <p className="text-slate text-sm mb-4">
        Foto-URL der Preisliste eingeben. Die KI erkennt Dienstleistungen und Preise
        und trägt sie automatisch auf der Website ein.
      </p>
      <input type="url" placeholder="https://… (Foto-URL)" value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent mb-4" />
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-sm text-green-800">
          ✓ {result.total} Dienstleistungen gespeichert
          <span className="text-green-600"> ({result.matched} Katalog, {result.custom} individuell)</span>
        </div>
      )}
      <button onClick={scan} disabled={scanning}
        className="w-full bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
        {scanning ? "KI analysiert… (bis zu 1 Min.)" : "Scannen"}
      </button>
    </ToolModal>
  );
}

function LogoGenerateModal({ project, toast, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/logo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: project.project_id, salon_name: project.salon_name || "" }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error || "Logo-Generierung fehlgeschlagen.", "error"); return; }
      setLogoUrl(data.url);
      toast("Logo erstellt und gespeichert.", "success");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <ToolModal title={`KI-Logo: ${project.salon_name || ""}`} onClose={onClose}>
      <p className="text-slate text-sm mb-4">
        Erstellt ein neues Logo mit KI und speichert es als Projekt-Logo.
        Vorhandenes Logo wird ersetzt.
      </p>
      {logoUrl && (
        <div className="mb-4 flex justify-center">
          <img src={logoUrl} alt="Generiertes Logo" className="w-40 h-40 rounded-2xl object-cover border border-gray-100" />
        </div>
      )}
      <button onClick={generate} disabled={generating}
        className="w-full bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
        {generating ? "KI erstellt Logo… (bis zu 1 Min.)" : logoUrl ? "Neu generieren" : "Logo generieren"}
      </button>
    </ToolModal>
  );
}

function DomainModal({ project, toast, onClose, onMoved }) {
  const [domain, setDomain] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null); // { domain, available }
  const [purchasing, setPurchasing] = useState(false);
  const [started, setStarted] = useState(false);

  async function check() {
    const d = domain.trim().toLowerCase();
    if (!d.includes(".")) { toast("Gültige Domain eingeben (z.B. mein-salon.de).", "error"); return; }
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch("/api/admin/domains/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error || "Prüfung fehlgeschlagen.", "error"); return; }
      setCheckResult(data);
    } finally {
      setChecking(false);
    }
  }

  async function purchase() {
    setPurchasing(true);
    try {
      const res = await fetch("/api/admin/domains/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: project.project_id, domain: checkResult.domain }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error || "Kauf fehlgeschlagen.", "error"); return; }
      setStarted(true);
      onMoved?.(checkResult.domain);
      toast("Domain-Kauf gestartet — Ergebnis kommt per Telegram.", "success");
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <ToolModal title={`Eigene Domain: ${project.salon_name || ""}`} onClose={onClose}>
      {started ? (
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🚀</div>
          <p className="text-ink font-medium mb-2">Kauf & Umzug gestartet!</p>
          <p className="text-slate text-sm mb-4">
            Die Domain <strong>{checkResult?.domain}</strong> wird gekauft und die Website
            dorthin umgezogen. Das Ergebnis wird per Telegram gemeldet.
            DNS-Verbreitung kann 1–24 Stunden dauern.
          </p>
          <button onClick={onClose} className="w-full border border-gray-200 text-slate py-2.5 rounded-xl hover:bg-gray-50 text-sm">Schließen</button>
        </div>
      ) : (
        <>
          <p className="text-slate text-sm mb-4">
            Neue Domain kaufen und die Website von der Subdomain dorthin umziehen.
            Aktuelle Adresse: <span className="font-mono text-xs">{project.live_url || "—"}</span>
          </p>
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="mein-salon.de" value={domain}
              onChange={e => { setDomain(e.target.value); setCheckResult(null); }}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <button onClick={check} disabled={checking}
              className="bg-ink text-white text-sm px-4 py-2.5 rounded-xl hover:bg-slate transition-colors disabled:opacity-60 shrink-0">
              {checking ? "Prüft…" : "Prüfen"}
            </button>
          </div>
          {checkResult && (
            checkResult.available ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-green-800 text-sm font-medium mb-3">✓ {checkResult.domain} ist verfügbar!</p>
                <button onClick={purchase} disabled={purchasing}
                  className="w-full bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
                  {purchasing ? "Startet…" : "Kaufen & Veröffentlichen"}
                </button>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
                ✕ {checkResult.domain} ist bereits vergeben. Bitte andere Domain versuchen.
              </div>
            )
          )}
        </>
      )}
    </ToolModal>
  );
}

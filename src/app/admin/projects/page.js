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
                <div className="flex gap-2">
                  <button onClick={() => setEditing({ ...selected })}
                    className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                    Bearbeiten
                  </button>
                  <button onClick={() => triggerPipeline(selected.project_id)} disabled={triggerLoading === selected.project_id}
                    className="flex-1 border border-gray-200 text-ink py-2.5 rounded-xl hover:bg-gray-50 text-sm transition-colors disabled:opacity-60">
                    {triggerLoading === selected.project_id ? "Startet…" : "▶ Pipeline"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

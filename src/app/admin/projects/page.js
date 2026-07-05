"use client";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "../../../components/Toast";
import ProjectDetailModal from "./ProjectDetailModal";

const STATUS_OPTS = ["all","pending","in_progress","waiting_user","completed","cancelled","failed"];
const STATUS_COLORS = {
  pending:      "bg-yellow-100 text-yellow-800",
  in_progress:  "bg-blue-100 text-blue-800",
  waiting_user: "bg-purple-100 text-purple-800",
  completed:    "bg-green-100 text-green-800",
  cancelled:    "bg-gray-100 text-gray-600",
  failed:       "bg-red-100 text-red-700",
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
  const [detailId, setDetailId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/projects")
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

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
    toast("Status aktualisiert.", "success");
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const payload = {
        salon_name: editItem.salon_name || null,
        status: editItem.status,
        live_url: editItem.live_url || null,
        city: editItem.city || null,
        expires_at: editItem.expires_at || null,
      };
      const res = await fetch(`/api/admin/projects/${editItem.project_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { toast("Fehler.", "error"); return; }
      setProjects(prev => prev.map(p => p.project_id === editItem.project_id ? { ...p, ...payload } : p));
      setEditItem(null);
      toast("Projekt aktualisiert.", "success");
    } finally {
      setSaving(false);
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
                      <button onClick={() => setDetailId(p.project_id)} className="font-medium text-ink hover:text-accent text-left">
                        {p.salon_name || "Unbenannt"}
                      </button>
                      <div className="text-xs text-slate/60 font-mono mt-0.5">{p.project_id?.slice(0,8)}…</div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-slate">{p.city || "—"}</td>
                    <td className="px-5 py-3.5">
                      <select value={p.status}
                        onChange={e => patchStatus(p.project_id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {["pending","in_progress","waiting_user","completed","cancelled","failed"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-slate text-xs">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("de-DE") : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setDetailId(p.project_id)}
                          className="text-xs bg-accent/10 hover:bg-accent/20 text-accent px-2.5 py-1 rounded-lg transition-colors">
                          Detail
                        </button>
                        <button onClick={() => setEditItem({ ...p })}
                          className="text-xs text-accent hover:underline">Bearbeiten</button>
                        {p.live_url && (
                          <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-slate hover:text-ink">↗</a>
                        )}
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

      {/* DETAIL MODAL (RestaurantAI yapısı: süreç çizelgesi + tüm eylemler) */}
      {detailId && (
        <ProjectDetailModal
          projectId={detailId}
          onClose={() => setDetailId(null)}
          onUpdated={load}
        />
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditItem(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-ink">{editItem.salon_name || "Projekt bearbeiten"}</h2>
              <button onClick={() => setEditItem(null)}
                className="text-slate hover:text-ink text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
            </div>
            <div className="space-y-4">
              {[
                ["Salonname", "salon_name", "text"],
                ["Status", "status", "select"],
                ["Live URL", "live_url", "text"],
                ["Stadt", "city", "text"],
                ["Läuft ab am", "expires_at", "date"],
              ].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate mb-1.5">{label}</label>
                  {type === "select" ? (
                    <select value={editItem[key] || ""} onChange={e => setEditItem(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent">
                      {["pending","in_progress","waiting_user","completed","cancelled","failed"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input type={type === "date" ? "date" : "text"} value={editItem[key] || ""}
                      onChange={e => setEditItem(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
                  )}
                </div>
              ))}
              <div className="flex gap-3 mt-2">
                <button onClick={saveEdit} disabled={saving}
                  className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
                  {saving ? "Speichert…" : "Speichern"}
                </button>
                <button onClick={() => setEditItem(null)} className="flex-1 border border-gray-200 text-slate py-2.5 rounded-xl hover:bg-gray-50 text-sm">Abbrechen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

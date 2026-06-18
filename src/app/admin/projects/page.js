"use client";
import { useState, useEffect } from "react";

const STATUS_OPTIONS = ["all", "pending", "info_submitted", "building", "completed", "cancelled"];
const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  info_submitted: "bg-blue-100 text-blue-800",
  building: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [triggerLoading, setTriggerLoading] = useState(null);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .finally(() => setLoading(false));
  }, []);

  async function triggerPipeline(projectId) {
    setTriggerLoading(projectId);
    try {
      await fetch("/api/admin/trigger-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
    } finally {
      setTriggerLoading(null);
    }
  }

  async function updateStatus(projectId, status) {
    await fetch(`/api/admin/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setProjects(prev => prev.map(p => p.project_id === projectId ? { ...p, status } : p));
    if (selected?.project_id === projectId) setSelected(prev => ({ ...prev, status }));
  }

  const filtered = projects.filter(p => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return p.salon_name?.toLowerCase().includes(s) || p.city?.toLowerCase().includes(s) || p.project_id?.includes(s);
    }
    return true;
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Projekte</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="Salon, Stadt, ID…" value={search} onChange={e => setSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent flex-1" />
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs rounded-xl border transition-colors ${filter === s ? "bg-ink text-white border-ink" : "bg-white text-slate border-gray-200 hover:border-gray-300"}`}>
              {s === "all" ? "Alle" : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-slate">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Salon</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Stadt</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Erstellt</th>
                <th className="text-right px-5 py-3 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.project_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <button onClick={() => setSelected(p)} className="font-medium text-ink hover:text-accent text-left">
                      {p.salon_name || "Unbenannt"}
                    </button>
                    <div className="text-xs text-slate/60 font-mono mt-0.5">{p.project_id?.slice(0, 8)}…</div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-slate">{p.city || "—"}</td>
                  <td className="px-5 py-4">
                    <select value={p.status} onChange={e => updateStatus(p.project_id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                      {["pending","info_submitted","building","completed","cancelled"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-slate text-xs">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("de-DE") : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.live_url && (
                        <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                          className="text-accent text-xs hover:underline">Öffnen</a>
                      )}
                      <button onClick={() => triggerPipeline(p.project_id)} disabled={triggerLoading === p.project_id}
                        className="text-xs bg-accent/10 hover:bg-accent/20 text-accent px-2.5 py-1 rounded-lg transition-colors disabled:opacity-60">
                        {triggerLoading === p.project_id ? "…" : "▶ Pipeline"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate">Keine Projekte gefunden</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-ink text-lg">{selected.salon_name || "Projekt Detail"}</h2>
              <button onClick={() => setSelected(null)} className="text-slate hover:text-ink text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Projekt ID", selected.project_id],
                ["Status", selected.status],
                ["Stadt", selected.city || "—"],
                ["Adresse", selected.address || "—"],
                ["Live URL", selected.live_url || "—"],
                ["Erstellt", selected.created_at ? new Date(selected.created_at).toLocaleString("de-DE") : "—"],
                ["Läuft ab", selected.expires_at ? new Date(selected.expires_at).toLocaleDateString("de-DE") : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="text-slate w-28 shrink-0">{k}:</span>
                  <span className="text-ink font-medium break-all">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => triggerPipeline(selected.project_id)} disabled={triggerLoading === selected.project_id}
                className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
                {triggerLoading === selected.project_id ? "Startet…" : "▶ Pipeline starten"}
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 border border-gray-200 text-slate py-2.5 rounded-xl hover:bg-gray-50 text-sm">Schließen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

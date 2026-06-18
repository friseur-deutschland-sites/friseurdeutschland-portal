"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Gesamt Projekte", value: stats.total_projects, icon: "🌐", color: "bg-blue-50 text-blue-700" },
    { label: "Live Websites", value: stats.live_projects, icon: "✅", color: "bg-green-50 text-green-700" },
    { label: "Ausstehend", value: stats.pending_projects, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
    { label: "Benutzer", value: stats.total_users, icon: "👥", color: "bg-purple-50 text-purple-700" },
    { label: "Umsatz (€)", value: `€${stats.total_revenue || 0}`, icon: "💶", color: "bg-orange-50 text-orange-700" },
    { label: "Neue heute", value: stats.new_today, icon: "🆕", color: "bg-pink-50 text-pink-700" },
  ] : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-8">Admin Dashboard</h1>
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {cards.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-4 ${c.color}`}>{c.icon}</div>
                <div className="text-3xl font-bold text-ink mb-1">{c.value}</div>
                <div className="text-slate text-sm">{c.label}</div>
              </div>
            ))}
          </div>

          {/* RECENT PROJECTS */}
          {stats?.recent_projects?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-display font-semibold text-ink">Neue Projekte</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {stats.recent_projects.map(p => (
                  <div key={p.project_id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-lg shrink-0">✂</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink truncate">{p.salon_name || "Unbenannt"}</div>
                      <div className="text-slate text-xs">{p.city || "—"}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      p.status === "completed" ? "bg-green-100 text-green-700" :
                      p.status === "building" ? "bg-purple-100 text-purple-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{p.status}</span>
                    <span className="text-slate text-xs shrink-0">{new Date(p.created_at).toLocaleDateString("de-DE")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

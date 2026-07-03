"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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
    { label: "Gesamt Projekte",   value: stats.total_projects,   icon: "🌐", color: "bg-blue-50 text-blue-700",   link: "/admin/projects" },
    { label: "Live Websites",     value: stats.live_projects,    icon: "✅", color: "bg-green-50 text-green-700",  link: "/admin/projects" },
    { label: "Ausstehend",        value: stats.pending_projects, icon: "⏳", color: "bg-yellow-50 text-yellow-700",link: "/admin/projects" },
    { label: "Benutzer",          value: stats.total_users,      icon: "👥", color: "bg-purple-50 text-purple-700",link: "/admin/users" },
    { label: "Gesamtumsatz (€)",  value: `€${(stats.total_revenue || 0).toFixed(0)}`, icon: "💶", color: "bg-emerald-50 text-emerald-700", link: "/admin/billing" },
    { label: "Offene Zahlungen",  value: `€${(stats.pending_revenue || 0).toFixed(0)}`, icon: "⚠️", color: "bg-orange-50 text-orange-700", link: "/admin/billing" },
  ] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <span className="text-slate text-sm">{new Date().toLocaleDateString("de-DE", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {cards.map((c, i) => (
              <Link href={c.link} key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow block">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-4 ${c.color}`}>
                  {c.icon}
                </div>
                <div className="text-3xl font-bold text-ink mb-1">{c.value}</div>
                <div className="text-slate text-sm">{c.label}</div>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* RECENT PROJECTS */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-display font-semibold text-ink">Neue Projekte</h2>
                <Link href="/admin/projects" className="text-accent text-xs hover:underline">Alle →</Link>
              </div>
              {stats?.recent_projects?.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {stats.recent_projects.map(p => (
                    <div key={p.project_id} className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-base shrink-0">✂</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-ink text-sm truncate">{p.salon_name || "Unbenannt"}</div>
                        <div className="text-slate text-xs">{p.city || "—"}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        p.status === "completed" ? "bg-green-100 text-green-700" :
                        p.status === "building"  ? "bg-purple-100 text-purple-700" :
                        "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                      <span className="text-slate text-xs shrink-0 hidden sm:block">
                        {new Date(p.created_at).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate text-sm">Keine Projekte vorhanden</div>
              )}
            </div>

            {/* QUICK ACTIONS + REVENUE SUMMARY */}
            <div className="space-y-4">
              {/* Monthly summary */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-display font-semibold text-ink mb-4">Übersicht</h2>
                <div className="space-y-3">
                  {[
                    { label: "Neue Projekte heute",   value: stats?.new_today ?? 0 },
                    { label: "Neue Projekte gesamt",  value: stats?.total_projects ?? 0 },
                    { label: "Neue Benutzer gesamt",  value: stats?.total_users ?? 0 },
                    { label: "Abgeschlossen",          value: stats?.live_projects ?? 0 },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-slate text-sm">{row.label}</span>
                      <span className="font-semibold text-ink">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-display font-semibold text-ink mb-4">Schnellzugriff</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Projekt anlegen",   href: "/admin/projects",  icon: "🌐" },
                    { label: "Benutzer anlegen",  href: "/admin/users",     icon: "👥" },
                    { label: "Listing hinzufügen",href: "/admin/listings",  icon: "📋" },
                    { label: "Preise anpassen",   href: "/admin/pricing",   icon: "💶" },
                  ].map((a, i) => (
                    <Link key={i} href={a.href}
                      className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-accent/30 hover:bg-accent/5 transition-all text-sm text-ink">
                      <span>{a.icon}</span>
                      <span>{a.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

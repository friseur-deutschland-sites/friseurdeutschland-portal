"use client";
import { useState, useEffect } from "react";

export default function AdminBilling() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/billing")
      .then(r => r.json())
      .then(d => setRecords(d.records || []))
      .finally(() => setLoading(false));
  }, []);

  const total = records.filter(r => r.status === "completed").reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Zahlungen</h1>
        <div className="bg-green-50 text-green-700 font-bold px-4 py-2 rounded-xl text-sm">
          Gesamt: €{total.toFixed(2)}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-slate">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Projekt</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Benutzer</th>
                <th className="text-left px-5 py-3 font-medium">Betrag</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-ink">{r.salon_name || "—"}</div>
                    <div className="text-xs text-slate/60 font-mono">{r.project_id?.slice(0, 8)}…</div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-slate">{r.user_email || "—"}</td>
                  <td className="px-5 py-4 font-bold text-ink">€{(r.amount || 0).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      r.status === "completed" ? "bg-green-100 text-green-700" :
                      r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-slate text-xs">
                    {r.created_at ? new Date(r.created_at).toLocaleString("de-DE") : "—"}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate">Keine Zahlungen vorhanden</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useToast } from "../../../components/Toast";

const STATUS_OPTS = ["all", "pending", "completed", "failed", "refunded"];
const STATUS_COLORS = {
  completed: "bg-green-100 text-green-700",
  pending:   "bg-yellow-100 text-yellow-700",
  failed:    "bg-red-100 text-red-700",
  refunded:  "bg-gray-100 text-gray-500",
};

const EMPTY = { project_id: "", user_id: "", amount: "", status: "pending", notes: "", due_date: "" };

export default function AdminBilling() {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const d = await fetch("/api/admin/billing").then(r => r.json()).catch(() => ({ records: [] }));
    setRecords(d.records || []);
    setLoading(false);
  }

  async function create() {
    if (!form.amount) { toast("Betrag erforderlich.", "error"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error || "Fehler.", "error"); return; }
      await load();
      setShowCreate(false);
      setForm(EMPTY);
      toast("Zahlung erstellt.", "success");
    } finally {
      setCreating(false);
    }
  }

  async function save(id, payload) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/billing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { toast("Fehler.", "error"); return; }
      setRecords(prev => prev.map(r => r.id === id ? { ...r, ...payload } : r));
      if (editItem?.id === id) setEditItem(p => ({ ...p, ...payload }));
      toast("Gespeichert.", "success");
    } finally {
      setSaving(null);
    }
  }

  async function remove(id) {
    if (!confirm("Zahlung löschen?")) return;
    const res = await fetch(`/api/admin/billing/${id}`, { method: "DELETE" });
    if (!res.ok) { toast("Fehler beim Löschen.", "error"); return; }
    setRecords(prev => prev.filter(r => r.id !== id));
    toast("Zahlung gelöscht.", "success");
  }

  const filtered = filter === "all" ? records : records.filter(r => r.status === filter);
  const totalPaid = records.filter(r => r.status === "completed").reduce((s, r) => s + (r.amount || 0), 0);
  const totalPending = records.filter(r => r.status === "pending").reduce((s, r) => s + (r.amount || 0), 0);

  function csvExport() {
    const rows = [["ID","Projekt","Betrag","Status","Datum"]];
    filtered.forEach(r => rows.push([r.id, r.project_id || "", r.amount, r.status, r.created_at?.split("T")[0] || ""]));
    const blob = new Blob([rows.map(r => r.join(";")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "zahlungen.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">Zahlungen</h1>
        <div className="flex items-center gap-2">
          <button onClick={csvExport} className="text-sm text-slate border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            ↓ CSV Export
          </button>
          <button onClick={() => setShowCreate(true)}
            className="bg-accent hover:bg-accentdark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            + Neue Zahlung
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate mb-1">Gesamtumsatz</div>
          <div className="text-2xl font-bold text-green-700">€{totalPaid.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate mb-1">Offene Zahlungen</div>
          <div className="text-2xl font-bold text-yellow-600">€{totalPending.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate mb-1">Einträge gesamt</div>
          <div className="text-2xl font-bold text-ink">{records.length}</div>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_OPTS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-xl border transition-colors ${filter === s ? "bg-ink text-white border-ink" : "bg-white text-slate border-gray-200 hover:border-gray-300"}`}>
            {s === "all" ? "Alle" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-slate text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Projekt / Notiz</th>
                <th className="text-left px-5 py-3 font-medium">Betrag</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Datum</th>
                <th className="text-right px-5 py-3 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-ink truncate max-w-[200px]">{r.project_id ? `${r.project_id.slice(0,8)}…` : "—"}</div>
                    {r.notes && <div className="text-xs text-slate mt-0.5">{r.notes}</div>}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-ink">€{(r.amount || 0).toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <select value={r.status}
                      onChange={e => save(r.id, { status: e.target.value })}
                      disabled={saving === r.id}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                      {["pending","completed","failed","refunded"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-slate text-xs">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("de-DE") : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditItem({ ...r })} className="text-xs text-accent hover:underline">Bearbeiten</button>
                      <button onClick={() => remove(r.id)} className="text-xs text-red-500 hover:text-red-700">Löschen</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate">Keine Zahlungen gefunden</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <Modal title="Neue Zahlung" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            {[
              ["Projekt-ID (optional)", "project_id", "text"],
              ["Benutzer-ID (optional)", "user_id", "text"],
              ["Betrag (€)", "amount", "number"],
              ["Fälligkeitsdatum", "due_date", "date"],
              ["Notiz", "notes", "text"],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate mb-1.5">{label}</label>
                <input type={type} value={form[key] || ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent">
                {["pending","completed","failed","refunded"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={create} disabled={creating}
              className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
              {creating ? "Erstellt…" : "Zahlung erstellen"}
            </button>
            <button onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 text-slate py-2.5 rounded-xl hover:bg-gray-50 text-sm">Abbrechen</button>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <Modal title="Zahlung bearbeiten" onClose={() => setEditItem(null)}>
          <div className="space-y-4">
            {[
              ["Betrag (€)", "amount", "number"],
              ["Fälligkeitsdatum", "due_date", "date"],
              ["Notiz", "notes", "text"],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate mb-1.5">{label}</label>
                <input type={type} value={editItem[key] || ""} onChange={e => setEditItem(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate mb-1.5">Status</label>
              <select value={editItem.status} onChange={e => setEditItem(p => ({ ...p, status: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent">
                {["pending","completed","failed","refunded"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => { save(editItem.id, { amount: parseFloat(editItem.amount)||0, status: editItem.status, notes: editItem.notes, due_date: editItem.due_date||null }); setEditItem(null); }}
              disabled={saving === editItem.id}
              className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
              Speichern
            </button>
            <button onClick={() => setEditItem(null)} className="flex-1 border border-gray-200 text-slate py-2.5 rounded-xl hover:bg-gray-50 text-sm">Abbrechen</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="text-slate hover:text-ink text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

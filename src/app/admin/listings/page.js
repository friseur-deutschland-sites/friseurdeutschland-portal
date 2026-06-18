"use client";
import { useState, useEffect } from "react";

const EMPTY = { salon_name: "", city: "", website_url: "", logo_url: "", cover_photo_url: "", is_active: true };

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/listings")
      .then(r => r.json())
      .then(d => setListings(d.listings || []))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      if (editing.id) {
        await fetch(`/api/admin/listings/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing),
        });
        setListings(prev => prev.map(l => l.id === editing.id ? editing : l));
      } else {
        const res = await fetch("/api/admin/listings", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing),
        });
        const data = await res.json();
        setListings(prev => [{ ...editing, id: data.id }, ...prev]);
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Listing löschen?")) return;
    await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
    setListings(prev => prev.filter(l => l.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Listings</h1>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="bg-accent hover:bg-accentdark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          + Neues Listing
        </button>
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
                <th className="text-right px-5 py-3 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listings.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {l.logo_url
                        ? <img src={l.logo_url} alt="logo" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        : <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-sm shrink-0">✂</div>
                      }
                      <span className="font-medium text-ink">{l.salon_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-slate">{l.city || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${l.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {l.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditing({ ...l })} className="text-xs text-accent hover:underline">Bearbeiten</button>
                      <button onClick={() => remove(l.id)} className="text-xs text-red-500 hover:text-red-700">Löschen</button>
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-slate">Keine Listings vorhanden</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="font-display font-bold text-ink text-lg mb-5">{editing.id ? "Listing bearbeiten" : "Neues Listing"}</h2>
            <div className="space-y-4">
              {[
                ["Salonname", "salon_name", "text"],
                ["Stadt", "city", "text"],
                ["Website URL", "website_url", "url"],
                ["Logo URL", "logo_url", "url"],
                ["Cover Foto URL", "cover_photo_url", "url"],
              ].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate mb-1">{label}</label>
                  <input type={type} value={editing[key] || ""} onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm text-slate cursor-pointer">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))} />
                Aktiv (auf Startseite anzeigen)
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving}
                className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
                {saving ? "Speichert…" : "Speichern"}
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 border border-gray-200 text-slate py-2.5 rounded-xl hover:bg-gray-50 text-sm">Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

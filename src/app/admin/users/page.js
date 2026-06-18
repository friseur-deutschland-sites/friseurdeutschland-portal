"use client";
import { useState, useEffect } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(id, current) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !current } : u));
  }

  async function setRole(id, role) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  }

  const filtered = search
    ? users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Benutzer</h1>
      <div className="mb-5">
        <input type="text" placeholder="E-Mail suchen…" value={search} onChange={e => setSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent w-full max-w-sm" />
      </div>
      {loading ? (
        <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-slate">
              <tr>
                <th className="text-left px-5 py-3 font-medium">E-Mail</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Rolle</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Registriert</th>
                <th className="text-right px-5 py-3 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-ink">{u.email}</td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <select value={u.role} onChange={e => setRole(u.id, e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-ink outline-none">
                      <option value="customer">customer</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {u.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-slate text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("de-DE") : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => toggleActive(u.id, u.is_active)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${u.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                      {u.is_active ? "Deaktivieren" : "Aktivieren"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate">Keine Benutzer gefunden</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

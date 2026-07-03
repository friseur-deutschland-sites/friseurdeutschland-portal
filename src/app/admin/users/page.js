"use client";
import { useState, useEffect } from "react";
import { useToast } from "../../../components/Toast";

const PERMS = [
  { key: "can_self_create", label: "Website erstellen (PayPal)" },
  { key: "can_create_free", label: "Kostenlose Website erstellen" },
  { key: "is_premium",      label: "Premium-Rabatt aktiv" },
];

const EMPTY_USER = { email: "", password: "", role: "customer", is_active: true, can_self_create: false, can_create_free: false, is_premium: false, telegram_user_id: "" };

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_USER);
  const [creating, setCreating] = useState(false);
  const [editPerm, setEditPerm] = useState(null);
  const [saving, setSaving] = useState(null);
  const [resetModal, setResetModal] = useState(null);
  const [resetPw, setResetPw] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .finally(() => setLoading(false));
  }, []);

  async function createUser() {
    if (!newUser.email || !newUser.password) { toast("E-Mail und Passwort erforderlich.", "error"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error || "Fehler beim Erstellen.", "error"); return; }
      setUsers(prev => [{ ...newUser, id: data.id, created_at: new Date().toISOString() }, ...prev]);
      setShowCreate(false);
      setNewUser(EMPTY_USER);
      toast("Benutzer erfolgreich erstellt.", "success");
    } finally {
      setCreating(false);
    }
  }

  async function patch(id, payload, successMsg) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { toast("Fehler beim Speichern.", "error"); return; }
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...payload } : u));
      if (editPerm?.id === id) setEditPerm(prev => ({ ...prev, ...payload }));
      toast(successMsg || "Gespeichert.", "success");
    } finally {
      setSaving(null);
    }
  }

  async function resetPassword() {
    if (resetPw.length < 8) { toast("Mindestens 8 Zeichen.", "error"); return; }
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/users/${resetModal.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: resetPw }),
      });
      if (!res.ok) { toast("Fehler.", "error"); return; }
      setResetModal(null);
      setResetPw("");
      toast("Passwort wurde zurückgesetzt.", "success");
    } finally {
      setResetting(false);
    }
  }

  const filtered = search
    ? users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Benutzer</h1>
        <button onClick={() => setShowCreate(true)}
          className="bg-accent hover:bg-accentdark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
          + Neuer Benutzer
        </button>
      </div>

      <div className="mb-5">
        <input type="text" placeholder="E-Mail suchen…" value={search} onChange={e => setSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent w-full max-w-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-slate text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">E-Mail</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Rolle</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Erstellt</th>
                <th className="text-right px-5 py-3 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-ink">{u.email}</div>
                    {u.telegram_user_id && <div className="text-xs text-slate">Telegram: {u.telegram_user_id}</div>}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {u.can_self_create && <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">PayPal</span>}
                      {u.can_create_free && <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Free</span>}
                      {u.is_premium && <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">Premium</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <select value={u.role}
                      onChange={e => patch(u.id, { role: e.target.value }, "Rolle aktualisiert.")}
                      disabled={saving === u.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-ink outline-none cursor-pointer">
                      <option value="customer">customer</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => patch(u.id, { is_active: !u.is_active }, u.is_active ? "Deaktiviert." : "Aktiviert.")}
                      disabled={saving === u.id}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        u.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}>
                      {u.is_active ? "Aktiv" : "Inaktiv"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-slate text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("de-DE") : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditPerm({ ...u })}
                        className="text-xs text-accent hover:underline">Berechtigungen</button>
                      <button onClick={() => { setResetModal(u); setResetPw(""); }}
                        className="text-xs text-slate hover:text-ink">Passwort</button>
                    </div>
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

      {/* CREATE USER MODAL */}
      {showCreate && (
        <Modal title="Neuer Benutzer" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <Field label="E-Mail">
              <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
            </Field>
            <Field label="Passwort (min. 8 Zeichen)">
              <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
            </Field>
            <Field label="Rolle">
              <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent">
                <option value="customer">customer</option>
                <option value="admin">admin</option>
              </select>
            </Field>
            <Field label="Telegram User ID (optional)">
              <input type="text" value={newUser.telegram_user_id} onChange={e => setNewUser(p => ({ ...p, telegram_user_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
            </Field>
            <div className="space-y-2">
              {PERMS.map(p => (
                <label key={p.key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!!newUser[p.key]} onChange={e => setNewUser(u => ({ ...u, [p.key]: e.target.checked }))}
                    className="w-4 h-4 accent-accent" />
                  <span className="text-sm text-slate">{p.label}</span>
                </label>
              ))}
            </div>
          </div>
          <ModalActions>
            <button onClick={createUser} disabled={creating}
              className="flex-1 bg-accent hover:bg-accentdark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
              {creating ? "Erstellt…" : "Benutzer erstellen"}
            </button>
            <button onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 text-slate py-2.5 rounded-xl hover:bg-gray-50 text-sm">Abbrechen</button>
          </ModalActions>
        </Modal>
      )}

      {/* PERMISSIONS MODAL */}
      {editPerm && (
        <Modal title={`Berechtigungen: ${editPerm.email}`} onClose={() => setEditPerm(null)}>
          <div className="space-y-3">
            {PERMS.map(p => (
              <label key={p.key} className="flex items-center justify-between cursor-pointer bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm text-ink">{p.label}</span>
                <input type="checkbox" checked={!!editPerm[p.key]}
                  onChange={e => {
                    const val = e.target.checked;
                    setEditPerm(u => ({ ...u, [p.key]: val }));
                    patch(editPerm.id, { [p.key]: val }, `${p.label} aktualisiert.`);
                  }}
                  className="w-4 h-4 accent-accent" />
              </label>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Telegram User ID</label>
              <div className="flex gap-2">
                <input type="text"
                  defaultValue={editPerm.telegram_user_id || ""}
                  id="tg-id-input"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
                <button onClick={() => {
                  const val = document.getElementById("tg-id-input").value;
                  patch(editPerm.id, { telegram_user_id: val || null }, "Telegram ID gespeichert.");
                }} className="bg-ink text-white text-sm px-4 py-2 rounded-xl hover:bg-slate transition-colors">
                  Speichern
                </button>
              </div>
            </div>
          </div>
          <ModalActions>
            <button onClick={() => setEditPerm(null)} className="w-full border border-gray-200 text-slate py-2.5 rounded-xl hover:bg-gray-50 text-sm">Schließen</button>
          </ModalActions>
        </Modal>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModal && (
        <Modal title={`Passwort zurücksetzen: ${resetModal.email}`} onClose={() => setResetModal(null)}>
          <Field label="Neues Passwort (min. 8 Zeichen)">
            <input type="password" value={resetPw} onChange={e => setResetPw(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
          </Field>
          <ModalActions>
            <button onClick={resetPassword} disabled={resetting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
              {resetting ? "Wird gesetzt…" : "Passwort zurücksetzen"}
            </button>
            <button onClick={() => setResetModal(null)} className="flex-1 border border-gray-200 text-slate py-2.5 rounded-xl hover:bg-gray-50 text-sm">Abbrechen</button>
          </ModalActions>
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

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ children }) {
  return <div className="flex gap-3 mt-6">{children}</div>;
}

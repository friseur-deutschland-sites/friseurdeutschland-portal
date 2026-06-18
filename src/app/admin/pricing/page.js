"use client";
import { useState, useEffect } from "react";

const EMPTY_PLAN = { name: "", price: "", description: "", features: [], is_featured: false, is_active: true };

export default function AdminPricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [featuresText, setFeaturesText] = useState("");

  useEffect(() => {
    fetch("/api/admin/pricing")
      .then(r => r.json())
      .then(d => setPlans(d.plans || []))
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing({ ...EMPTY_PLAN });
    setFeaturesText("");
  }

  function openEdit(plan) {
    setEditing({ ...plan });
    setFeaturesText((plan.features || []).join("\n"));
  }

  async function save() {
    setSaving(true);
    const payload = {
      ...editing,
      price: parseFloat(editing.price) || 0,
      features: featuresText.split("\n").map(f => f.trim()).filter(Boolean),
    };
    try {
      if (editing.id) {
        await fetch(`/api/admin/pricing/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setPlans(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload } : p));
      } else {
        const res = await fetch("/api/admin/pricing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setPlans(prev => [...prev, { ...payload, id: data.id }]);
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function deletePlan(id) {
    if (!confirm("Plan löschen?")) return;
    await fetch(`/api/admin/pricing/${id}`, { method: "DELETE" });
    setPlans(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Preispläne</h1>
        <button onClick={openNew} className="bg-accent hover:bg-accentdark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          + Neuer Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${plan.is_featured ? "border-accent" : "border-transparent"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-ink">{plan.name}</h3>
                  <div className="text-2xl font-bold text-accent mt-1">€{plan.price}<span className="text-slate text-sm font-normal">/Jahr</span></div>
                </div>
                <div className="flex gap-1">
                  {plan.is_featured && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Beliebt</span>}
                  {!plan.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inaktiv</span>}
                </div>
              </div>
              {plan.description && <p className="text-slate text-sm mb-3">{plan.description}</p>}
              <ul className="space-y-1 mb-4">
                {(plan.features || []).slice(0, 4).map((f, i) => (
                  <li key={i} className="text-sm text-slate flex gap-2"><span className="text-accent">✓</span>{f}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button onClick={() => openEdit(plan)} className="flex-1 text-sm border border-gray-200 py-2 rounded-xl hover:bg-gray-50 transition-colors">Bearbeiten</button>
                <button onClick={() => deletePlan(plan.id)} className="text-sm text-red-500 hover:text-red-700 px-3">✕</button>
              </div>
            </div>
          ))}
          {plans.length === 0 && <div className="col-span-3 text-center py-16 text-slate">Keine Preispläne vorhanden</div>}
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="font-display font-bold text-ink text-lg mb-5">{editing.id ? "Plan bearbeiten" : "Neuer Plan"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate mb-1">Name</label>
                <input value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-1">Preis (€/Jahr)</label>
                <input type="number" value={editing.price} onChange={e => setEditing(p => ({ ...p, price: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-1">Beschreibung</label>
                <textarea rows={2} value={editing.description || ""} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-1">Features (eine pro Zeile)</label>
                <textarea rows={5} value={featuresText} onChange={e => setFeaturesText(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent resize-none font-mono" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate cursor-pointer">
                  <input type="checkbox" checked={editing.is_featured} onChange={e => setEditing(p => ({ ...p, is_featured: e.target.checked }))} />
                  Beliebt (hervorgehoben)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate cursor-pointer">
                  <input type="checkbox" checked={editing.is_active} onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))} />
                  Aktiv
                </label>
              </div>
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

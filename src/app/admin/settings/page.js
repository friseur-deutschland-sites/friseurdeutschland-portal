"use client";
import { useState, useEffect } from "react";

const DEFAULT_SETTINGS = {
  self_registration_enabled: "true",
  telegram_bot_link: "",
  site_title: "FriseurDeutschland",
  support_email: "info@friseurdeutschland.de",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        if (d.settings) setSettings(s => ({ ...s, ...d.settings }));
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveSettings() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { key: "self_registration_enabled", label: "Selbstregistrierung erlauben", type: "toggle" },
    { key: "telegram_bot_link", label: "Telegram Bot Link", type: "url" },
    { key: "site_title", label: "Website-Titel", type: "text" },
    { key: "support_email", label: "Support E-Mail", type: "email" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-8">Einstellungen</h1>

      {loading ? (
        <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>
      ) : (
        <div className="max-w-xl space-y-5">
          {fields.map(f => (
            <div key={f.key} className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-medium text-ink mb-3">{f.label}</label>
              {f.type === "toggle" ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSettings(s => ({ ...s, [f.key]: s[f.key] === "true" ? "false" : "true" }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings[f.key] === "true" ? "bg-accent" : "bg-gray-200"}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[f.key] === "true" ? "left-7" : "left-1"}`} />
                  </button>
                  <span className="text-sm text-slate">{settings[f.key] === "true" ? "Aktiviert" : "Deaktiviert"}</span>
                </div>
              ) : (
                <input type={f.type} value={settings[f.key] || ""} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
              )}
            </div>
          ))}

          <div className="flex items-center gap-4">
            <button onClick={saveSettings} disabled={saving}
              className="bg-accent hover:bg-accentdark text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
              {saving ? "Speichert…" : "Einstellungen speichern"}
            </button>
            {saved && <span className="text-green-600 text-sm">✓ Gespeichert</span>}
          </div>
        </div>
      )}
    </div>
  );
}

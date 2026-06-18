"use client";

import { useLang, LANGS, LANG_LABELS } from "../lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex gap-1">
      {LANGS.map((l) => (
        <button key={l} onClick={() => setLang(l)}
          className={`text-xs font-medium px-2 py-1 rounded transition ${
            lang === l ? "bg-accent text-white" : "text-slate hover:text-ink"
          }`}>
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

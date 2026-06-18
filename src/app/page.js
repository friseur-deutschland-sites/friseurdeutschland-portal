"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import SalonCard from "../components/SalonCard";

const SalonMap = dynamic(() => import("../components/SalonMap"), { ssr: false });

export default function Home() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("alle");
  const [view, setView] = useState("grid"); // "grid" | "map"
  const [search, setSearch] = useState("");

  const fetchSalons = useCallback(async (c) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/salons?city=${encodeURIComponent(c)}`);
      const { salons: data } = await res.json();
      setSalons(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSalons("alle"); }, [fetchSalons]);

  useEffect(() => {
    // Şehir listesini salon verilerinden türet
    const unique = [...new Set(salons.map(s => s.city).filter(Boolean))].sort();
    setCities(unique);
  }, [salons]);

  const filtered = search
    ? salons.filter(s =>
        s.salon_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.city?.toLowerCase().includes(search.toLowerCase()) ||
        s.address?.toLowerCase().includes(search.toLowerCase())
      )
    : salons;

  return (
    <div className="min-h-screen bg-cream font-body">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✂</span>
            <span className="font-display text-xl font-bold text-ink">FriseurDeutschland</span>
          </div>
          <a href="/termin" className="hidden sm:block text-sm text-accent font-medium hover:underline">
            Salon eintragen
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-ink py-16 px-4 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Finden Sie Ihren<br/>
          <span className="text-accent">Friseursalon</span>
        </h1>
        <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
          Professionelle Friseure in ganz Deutschland — online Termin buchen, direkt in Ihrem Salon.
        </p>

        {/* Arama kutusu */}
        <div className="flex max-w-lg mx-auto gap-2">
          <input
            type="text"
            placeholder="Salonname oder Stadt suchen…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white rounded-xl px-4 py-3 text-sm text-ink placeholder-slate/50 outline-none focus:ring-2 focus:ring-accent"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-3 text-sm transition-colors">
              ✕
            </button>
          )}
        </div>

        {/* İstatistik */}
        <div className="flex items-center justify-center gap-8 mt-10 text-white/40 text-sm">
          <span><b className="text-accent text-xl">{salons.length}</b> Salons</span>
          <span><b className="text-accent text-xl">{cities.length}</b> Städte</span>
        </div>
      </section>

      {/* FİLTRELER + GÖRÜNÜm */}
      <section className="bg-white border-b border-gray-100 sticky top-[57px] z-30">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {/* Şehir filtresi */}
          <select value={city} onChange={e => { setCity(e.target.value); fetchSalons(e.target.value); }}
            className="shrink-0 bg-gray-50 border border-gray-200 rounded-xl text-sm px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-accent">
            <option value="alle">Alle Städte</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="h-5 w-px bg-gray-200 shrink-0"/>

          {/* Grid / Harita geçiş */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 shrink-0">
            {[["grid","☰ Liste"],["map","🗺 Karte"]].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 text-sm transition-colors ${view === v ? "bg-ink text-white" : "bg-white text-slate hover:bg-gray-50"}`}>
                {label}
              </button>
            ))}
          </div>

          <span className="text-slate text-xs shrink-0 ml-auto">
            {filtered.length} Ergebnis{filtered.length !== 1 ? "se" : ""}
          </span>
        </div>
      </section>

      {/* İÇERİK */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-5xl mb-4 block">✂</span>
            <p className="text-slate text-lg">Kein Salon gefunden</p>
            <button onClick={() => { setSearch(""); setCity("alle"); fetchSalons("alle"); }}
              className="mt-4 text-accent text-sm hover:underline">Filter zurücksetzen</button>
          </div>
        ) : view === "map" ? (
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <SalonMap salons={filtered} />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(s => <SalonCard key={s.project_id} salon={s} />)}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-ink mt-16 py-8 px-4 text-center text-white/30 text-xs">
        <p>© {new Date().getFullYear()} FriseurDeutschland — Ihr Salon-Verzeichnis für Deutschland</p>
        <p className="mt-1">
          <a href="/impressum" className="hover:text-white mr-4">Impressum</a>
          <a href="/datenschutz" className="hover:text-white">Datenschutz</a>
        </p>
      </footer>
    </div>
  );
}

"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Logo from "../components/Logo";
import LanguageSwitcher from "../components/LanguageSwitcher";
import SalonCard from "../components/SalonCard";
import { useLang } from "../lib/i18n";

const SalonMap = dynamic(() => import("../components/SalonMap"), { ssr: false });

export default function HomePageClient({ initialSalons = [], allCities = [], pricingPlans = [], listings = [] }) {
  const { tx } = useLang();
  const [salons, setSalons] = useState(initialSalons);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("alle");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");

  async function fetchSalons(c) {
    setLoading(true);
    try {
      const res = await fetch(`/api/salons?city=${encodeURIComponent(c)}`);
      const { salons: data } = await res.json();
      setSalons(data || []);
    } finally {
      setLoading(false);
    }
  }

  const filtered = search
    ? salons.filter(s =>
        s.salon_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.city?.toLowerCase().includes(search.toLowerCase()) ||
        s.address?.toLowerCase().includes(search.toLowerCase()))
    : salons;

  return (
    <div className="min-h-screen bg-cream font-body">
      {/* NAVBAR */}
      <header className="bg-white/95 backdrop-blur border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <Logo size={36} showText />
          <nav className="hidden md:flex items-center gap-6 ml-8 text-sm font-medium text-slate">
            <a href="#directory" className="hover:text-ink transition-colors">{tx.nav_directory || "Salons"}</a>
            <a href="#features" className="hover:text-ink transition-colors">{tx.nav_features || "Features"}</a>
            <a href="#pricing" className="hover:text-ink transition-colors">{tx.nav_pricing || "Preise"}</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate hover:text-ink transition-colors">
              {tx.login || "Anmelden"}
            </Link>
            <Link href="/register"
              className="bg-accent hover:bg-accentdark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              {tx.cta_btn || "Kostenlos starten"}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-ink overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute text-white/5 font-display font-bold"
              style={{
                fontSize: "180px",
                top: `${[10, 40, 70, 5, 50, 80][i]}%`,
                left: `${[5, 25, 55, 75, 85, 10][i]}%`,
                transform: `rotate(${[15, -20, 10, -15, 25, -10][i]}deg)`,
              }}>✂</div>
          ))}
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-sm px-4 py-1.5 rounded-full mb-6">
            <span>✂</span>
            <span>Professionelle Friseursalons in Deutschland</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {tx.hero_title || "Ihre Website für den"}<br />
            <span className="text-accent">{tx.hero_highlight || "Friseursalon"}</span>
          </h1>
          <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto">
            {tx.hero_sub || "Wir erstellen Ihre professionelle Salon-Website mit Online-Terminbuchung — schnell, einfach und bezahlbar."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="bg-accent hover:bg-accentdark text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors">
              {tx.hero_cta1 || "Jetzt Website erstellen"}
            </Link>
            <a href="#directory"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors">
              {tx.hero_cta2 || "Salons entdecken"}
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-10 mt-16 text-white/40 text-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{initialSalons.length || "0"}+</div>
              <div>{tx.stat_salons || "Salons"}</div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{allCities.length || "0"}+</div>
              <div>{tx.stat_cities || "Städte"}</div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div>{tx.stat_booking || "Online Buchung"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 bg-white scroll-mt-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-ink mb-4">
              {tx.features_title || "Alles was Ihr Salon braucht"}
            </h2>
            <p className="text-slate text-lg max-w-xl mx-auto">
              {tx.features_sub || "Vollständige Website-Lösung speziell für Friseursalons entwickelt."}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "📅", title: tx.feat1_title || "Online Termine", body: tx.feat1_body || "Kunden buchen rund um die Uhr Termine direkt auf Ihrer Website — ohne Telefonanrufe." },
              { icon: "🌐", title: tx.feat2_title || "Professionelle Website", body: tx.feat2_body || "Moderne, schnelle Website mit Galerie, Preisliste und Kontaktformular." },
              { icon: "📱", title: tx.feat3_title || "Mobile Optimiert", body: tx.feat3_body || "Ihre Seite funktioniert perfekt auf Smartphones, Tablets und Desktops." },
              { icon: "⭐", title: tx.feat4_title || "Bewertungen", body: tx.feat4_body || "Sammeln Sie Kundenbewertungen und stärken Sie Ihr Online-Ansehen." },
            ].map((f, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6 hover:shadow-md transition-shadow group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
                <h3 className="font-display font-semibold text-ink text-lg mb-2">{f.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-cream">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-ink mb-4">
              {tx.how_title || "So einfach funktioniert es"}
            </h2>
            <p className="text-slate text-lg">
              {tx.how_sub || "Ihre neue Website in 3 einfachen Schritten — fertig in wenigen Tagen."}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 relative">
            {[
              { step: "01", icon: "💬", title: tx.step1_title || "Anmelden & Info senden", body: tx.step1_body || "Registrieren Sie sich und senden Sie uns Ihre Salon-Informationen per Telegram-Bot." },
              { step: "02", icon: "⚡", title: tx.step2_title || "Wir bauen Ihre Website", body: tx.step2_body || "Unser System erstellt automatisch Ihre professionelle Website mit Terminbuchung." },
              { step: "03", icon: "✅", title: tx.step3_title || "Live & Online", body: tx.step3_body || "Ihre Website geht live. Kunden können sofort Termine online buchen." },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm h-full">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-3xl mx-auto mb-4">{s.icon}</div>
                  <div className="text-xs font-bold text-accent tracking-widest mb-2">{s.step}</div>
                  <h3 className="font-display font-semibold text-ink text-lg mb-3">{s.title}</h3>
                  <p className="text-slate text-sm leading-relaxed">{s.body}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-5 z-10 w-10 h-10 items-center justify-center -translate-y-1/2">
                    <div className="w-6 h-0.5 bg-accent" />
                    <div className="border-t-4 border-r-4 border-accent w-3 h-3 rotate-45 -ml-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/register"
              className="inline-block bg-accent hover:bg-accentdark text-white font-semibold px-10 py-4 rounded-xl text-base transition-colors">
              {tx.start_now || "Jetzt starten"}
            </Link>
          </div>
        </div>
      </section>

      {/* NEW PARTNERS */}
      {listings.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-2xl font-bold text-ink mb-2 text-center">
              {tx.new_partners_title || "Neu auf FriseurDeutschland"}
            </h2>
            <p className="text-slate text-center mb-8 text-sm">{tx.new_partners_sub || "Willkommen unseren neuesten Partnern"}</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.slice(0, 3).map((l) => (
                <div key={l.id} className="bg-cream rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  {l.cover_photo_url ? (
                    <div className="h-40 bg-gray-100 overflow-hidden">
                      <img src={l.cover_photo_url} alt={l.salon_name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-40 bg-ink/5 flex items-center justify-center text-5xl">✂</div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      {l.logo_url ? (
                        <img src={l.logo_url} alt="logo" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-xl shrink-0">✂</div>
                      )}
                      <div>
                        <h3 className="font-display font-semibold text-ink">{l.salon_name}</h3>
                        <p className="text-slate text-sm">{l.city}</p>
                      </div>
                    </div>
                    {l.website_url && (
                      <a href={l.website_url} target="_blank" rel="noopener noreferrer"
                        className="mt-4 block text-center text-sm font-medium text-accent hover:underline">
                        {tx.visit_website || "Website besuchen"} →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SALON DIRECTORY */}
      <section id="directory" className="py-16 px-4 bg-cream scroll-mt-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl font-bold text-ink mb-4">
              {tx.directory_title || "Friseursalons entdecken"}
            </h2>
            <p className="text-slate text-lg mb-8">
              {tx.directory_sub || "Finden Sie den perfekten Friseur in Ihrer Nähe."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                placeholder={tx.search_placeholder || "Salonname oder Stadt suchen…"}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-white rounded-xl px-4 py-3 text-sm text-ink placeholder-slate/50 border border-gray-200 outline-none focus:ring-2 focus:ring-accent"
              />
              <select value={city}
                onChange={e => { setCity(e.target.value); fetchSalons(e.target.value); }}
                className="bg-white border border-gray-200 rounded-xl text-sm px-4 py-3 text-ink outline-none focus:ring-2 focus:ring-accent">
                <option value="alle">{tx.all_cities || "Alle Städte"}</option>
                {allCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="text-slate text-sm">
              {filtered.length} {filtered.length === 1 ? (tx.result || "Ergebnis") : (tx.results || "Ergebnisse")}
            </span>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
              {[["grid", "☰ Liste"], ["map", "🗺 Karte"]].map(([v, label]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-4 py-2 text-sm transition-colors ${view === v ? "bg-ink text-white" : "text-slate hover:bg-gray-50"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : view === "map" ? (
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <SalonMap salons={filtered} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <span className="text-6xl block mb-4">✂</span>
              <p className="text-slate text-lg mb-2">{tx.no_salons || "Kein Salon gefunden"}</p>
              <button onClick={() => { setSearch(""); setCity("alle"); fetchSalons("alle"); }}
                className="text-accent text-sm hover:underline">{tx.reset_filter || "Filter zurücksetzen"}</button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(s => <SalonCard key={s.project_id} salon={s} />)}
            </div>
          )}
        </div>
      </section>

      {/* PRICING */}
      {pricingPlans.length > 0 && (
        <section id="pricing" className="py-20 px-4 bg-white scroll-mt-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="font-display text-4xl font-bold text-ink mb-4">
                {tx.pricing_title || "Einfache, transparente Preise"}
              </h2>
              <p className="text-slate text-lg">
                {tx.pricing_sub || "Keine versteckten Kosten. Kündigen Sie jederzeit."}
              </p>
            </div>
            <div className={`grid gap-6 ${pricingPlans.length === 2 ? "md:grid-cols-2 max-w-2xl mx-auto" : "md:grid-cols-3"}`}>
              {pricingPlans.map((plan) => (
                <div key={plan.id}
                  className={`rounded-2xl p-8 border-2 flex flex-col relative ${plan.is_featured ? "border-accent bg-ink text-white" : "border-gray-200 bg-white"}`}>
                  {plan.is_featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full">
                      {tx.most_popular || "Beliebt"}
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className={`font-display text-xl font-bold mb-1 ${plan.is_featured ? "text-white" : "text-ink"}`}>{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-5xl font-bold ${plan.is_featured ? "text-accent" : "text-ink"}`}>€{plan.price}</span>
                      <span className={`text-sm ${plan.is_featured ? "text-white/50" : "text-slate"}`}>/Jahr</span>
                    </div>
                    {plan.description && (
                      <p className={`text-sm leading-relaxed ${plan.is_featured ? "text-white/60" : "text-slate"}`}>{plan.description}</p>
                    )}
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-accent mt-0.5 shrink-0 font-bold">✓</span>
                        <span className={plan.is_featured ? "text-white/80" : "text-slate"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register"
                    className={`block text-center font-semibold py-3 rounded-xl transition-colors ${plan.is_featured
                      ? "bg-accent hover:bg-accentdark text-white"
                      : "bg-ink hover:bg-slate text-white"}`}>
                    {tx.get_started || "Jetzt starten"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-ink py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start gap-10 mb-10">
            <div className="flex-1 max-w-xs">
              <Logo size={40} showText />
              <p className="text-white/40 text-sm mt-3 leading-relaxed">
                {tx.footer_tagline || "Professionelle Websites & Online-Terminbuchung für Friseursalons in Deutschland."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-sm">
              <div>
                <h4 className="font-semibold text-white mb-4">{tx.footer_product || "Produkt"}</h4>
                <ul className="space-y-2.5 text-white/50">
                  <li><a href="#features" className="hover:text-white transition-colors">{tx.nav_features || "Features"}</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">{tx.nav_pricing || "Preise"}</a></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">{tx.register || "Registrieren"}</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">{tx.login || "Anmelden"}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">{tx.footer_company || "Unternehmen"}</h4>
                <ul className="space-y-2.5 text-white/50">
                  <li><a href="/impressum" className="hover:text-white transition-colors">Impressum</a></li>
                  <li><a href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</a></li>
                  <li><a href="mailto:info@friseurdeutschland.de" className="hover:text-white transition-colors">Kontakt</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/30 text-xs">
            © {new Date().getFullYear()} FriseurDeutschland — Ihr Salon-Verzeichnis für Deutschland
          </div>
        </div>
      </footer>
    </div>
  );
}

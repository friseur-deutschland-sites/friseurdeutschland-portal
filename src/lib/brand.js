/**
 * Marka yapılandırması — tek codebase, iki portal.
 *
 * Vercel'de iki proje aynı GitHub repo'yu kullanır; fark sadece env değişkeni:
 *   NEXT_PUBLIC_BRAND=friseur      → friseurdeutschland.de
 *   NEXT_PUBLIC_BRAND=nagelstudio  → nagelstudio-deutschland portalı
 *
 * Hem server hem client bileşenlerinde kullanılabilir (NEXT_PUBLIC_ önekli).
 */

const BRANDS = {
  friseur: {
    id: "friseur",
    businessType: "friseur",
    siteName: "FriseurDeutschland",
    logoSmall: "FRISEUR",
    logoBig: "Deutschland",
    metaTitle: "FriseurDeutschland — Professionelle Websites für Friseursalons",
    metaDescription:
      "Professionelle Websites mit Online-Terminbuchung für Friseursalons in Deutschland. Automatisch erstellt, sofort online.",
    heroTitle: "Ihre Salon-Website. Automatisch erstellt.",
    heroSubtitle:
      "Professionelle Website mit Online-Terminbuchung für Ihren Friseursalon — in wenigen Tagen online.",
    directoryTitle: "Friseursalons in Deutschland",
    businessWord: "Friseursalon",
    businessWordPlural: "Friseursalons",
  },
  nagelstudio: {
    id: "nagelstudio",
    businessType: "nagelstudio",
    siteName: "NagelstudioDeutschland",
    logoSmall: "NAGELSTUDIO",
    logoBig: "Deutschland",
    metaTitle: "NagelstudioDeutschland — Professionelle Websites für Nagelstudios",
    metaDescription:
      "Professionelle Websites mit Online-Terminbuchung für Nagelstudios in Deutschland. Automatisch erstellt, sofort online.",
    heroTitle: "Ihre Studio-Website. Automatisch erstellt.",
    heroSubtitle:
      "Professionelle Website mit Online-Terminbuchung für Ihr Nagelstudio — in wenigen Tagen online.",
    directoryTitle: "Nagelstudios in Deutschland",
    businessWord: "Nagelstudio",
    businessWordPlural: "Nagelstudios",
  },
};

const brandId = process.env.NEXT_PUBLIC_BRAND === "nagelstudio" ? "nagelstudio" : "friseur";

export const BRAND = BRANDS[brandId];
export const IS_NAGELSTUDIO = brandId === "nagelstudio";

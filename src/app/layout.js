import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LangProvider } from "../lib/i18n";

const body    = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "FriseurDeutschland — Professionelle Website für Ihren Friseursalon",
  description: "In wenigen Minuten zur professionellen Friseursalon-Website mit Online-Terminbuchung.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${body.variable} ${display.variable}`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}

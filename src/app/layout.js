import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const body    = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "FriseurDeutschland — Ihr Friseursalon-Verzeichnis",
  description: "Finden Sie professionelle Friseursalons in Ihrer Stadt und buchen Sie Ihren Termin online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${body.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}

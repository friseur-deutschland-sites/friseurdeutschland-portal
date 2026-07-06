import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LangProvider } from "../lib/i18n";
import { BRAND } from "../lib/brand";

const body    = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: BRAND.metaTitle,
  description: BRAND.metaDescription,
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

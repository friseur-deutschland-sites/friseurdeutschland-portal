"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../../components/Logo";
import LogoutButton from "../../components/LogoutButton";
import { ToastProvider } from "../../components/Toast";

const NAV = [
  { href: "/admin",           label: "Dashboard",      icon: "📊" },
  { href: "/admin/projects",  label: "Projekte",       icon: "🌐" },
  { href: "/admin/users",     label: "Benutzer",       icon: "👥" },
  { href: "/admin/listings",  label: "Listings",       icon: "📋" },
  { href: "/admin/pricing",   label: "Preise",         icon: "💶" },
  { href: "/admin/billing",   label: "Zahlungen",      icon: "💳" },
  { href: "/admin/settings",  label: "Einstellungen",  icon: "⚙️" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-cream font-body flex">
        {/* SIDEBAR */}
        <aside className="w-60 bg-ink flex-shrink-0 flex-col hidden md:flex sticky top-0 h-screen">
          <div className="p-5 border-b border-white/10">
            <Link href="/"><Logo size={32} showText /></Link>
            <div className="mt-2 text-xs text-white/40 font-medium tracking-wider">ADMIN PANEL</div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV.map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive(item.href)
                    ? "bg-accent text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}>
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {isActive(item.href) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              <span>←</span> <span>Zur Website</span>
            </Link>
            <LogoutButton />
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* MOBILE TOP */}
          <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
            <Link href="/"><Logo size={28} showText /></Link>
            <span className="text-xs text-slate ml-1 font-medium">Admin</span>
            <div className="ml-auto"><LogoutButton /></div>
          </header>
          {/* MOBILE NAV */}
          <nav className="md:hidden bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
            {NAV.map(item => (
              <Link key={item.href} href={item.href}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap ${
                  isActive(item.href) ? "bg-accent text-white" : "text-slate hover:bg-gray-50"
                }`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <main className="flex-1 p-5 md:p-7 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

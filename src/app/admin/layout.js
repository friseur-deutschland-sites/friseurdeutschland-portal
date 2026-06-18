import { redirect } from "next/navigation";
import { requireAdmin } from "../../lib/session";
import Link from "next/link";
import Logo from "../../components/Logo";
import LogoutButton from "../../components/LogoutButton";

export default async function AdminLayout({ children }) {
  const session = await requireAdmin();
  if (!session) redirect("/login");

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/projects", label: "Projekte", icon: "🌐" },
    { href: "/admin/users", label: "Benutzer", icon: "👥" },
    { href: "/admin/listings", label: "Listings", icon: "📋" },
    { href: "/admin/pricing", label: "Preise", icon: "💶" },
    { href: "/admin/billing", label: "Zahlungen", icon: "💳" },
    { href: "/admin/settings", label: "Einstellungen", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-cream font-body flex">
      {/* SIDEBAR */}
      <aside className="w-60 bg-ink flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-5 border-b border-white/10">
          <Link href="/"><Logo size={32} showText /></Link>
          <div className="mt-2 text-xs text-white/40">Admin Panel</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* MOBILE TOPBAR */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <Link href="/"><Logo size={28} showText /></Link>
          <span className="text-xs text-slate ml-2">Admin</span>
          <div className="ml-auto"><LogoutButton /></div>
        </header>
        {/* MOBILE NAV */}
        <nav className="md:hidden bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate hover:text-ink hover:bg-gray-50 text-xs transition-colors">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

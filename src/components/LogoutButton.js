"use client";

import { useRouter } from "next/navigation";
import { useLang } from "../lib/i18n";

export default function LogoutButton() {
  const router = useRouter();
  const { tx } = useLang();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleLogout}
      className="text-sm text-slate hover:text-ink transition font-medium">
      {tx.logout}
    </button>
  );
}

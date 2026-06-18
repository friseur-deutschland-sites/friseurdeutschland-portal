"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../../components/Logo";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useLang } from "../../lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { tx } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || tx.login_error); return; }
      router.push(data.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream px-4">
      <div className="mb-6"><Logo size={44} showText={true} /></div>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-display font-semibold text-ink">{tx.login_title}</h1>
          <LanguageSwitcher />
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate mb-1">{tx.email}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-1">{tx.password}</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accentdark text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-60">
            {loading ? tx.logging_in : tx.login_btn}
          </button>
        </form>
        <p className="text-center text-sm text-slate mt-4">
          {tx.no_account}{" "}
          <Link href="/register" className="text-accent hover:underline">{tx.register}</Link>
        </p>
      </div>
    </main>
  );
}

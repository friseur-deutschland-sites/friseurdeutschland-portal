"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StarPicker } from "../../components/StarRating";
import { Suspense } from "react";

function BewertenForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const salon = params.get("salon") || "";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState("form"); // "form" | "loading" | "done" | "error" | "used"

  async function submit(e) {
    e.preventDefault();
    if (!rating) return;
    setState("loading");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_token: token, rating, comment, guest_name: name }),
      });
      if (res.status === 409) { setState("used"); return; }
      if (!res.ok) { setState("error"); return; }
      setState("done");
    } catch { setState("error"); }
  }

  if (!token) return (
    <div className="text-center py-20">
      <p className="text-slate">Ungültiger Link</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">✂</span>
          <h1 className="font-display text-2xl font-bold text-ink mt-3">
            Wie war Ihr Besuch{salon ? ` bei ${salon}` : ""}?
          </h1>
          <p className="text-slate text-sm mt-2">
            Ihre Bewertung hilft anderen, den richtigen Salon zu finden.
          </p>
        </div>

        {state === "done" && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">⭐</div>
            <h2 className="font-display text-xl font-semibold text-ink">Vielen Dank!</h2>
            <p className="text-slate text-sm mt-2">Ihre Bewertung wurde gespeichert.</p>
          </div>
        )}

        {state === "used" && (
          <div className="text-center py-8">
            <p className="text-slate">Dieser Termin wurde bereits bewertet.</p>
          </div>
        )}

        {state === "error" && (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.</p>
          </div>
        )}

        {(state === "form" || state === "loading") && (
          <form onSubmit={submit} className="space-y-6">
            {/* Yıldız seçimi */}
            <div className="text-center">
              <p className="text-sm text-slate mb-3">Ihre Note (1–5 Sterne)</p>
              <div className="flex justify-center">
                <StarPicker value={rating} onChange={setRating} />
              </div>
              {rating > 0 && (
                <p className="text-xs text-accent mt-2">
                  {["","Mangelhaft","Ausreichend","Gut","Sehr gut","Ausgezeichnet"][rating]}
                </p>
              )}
            </div>

            {/* İsim */}
            <div>
              <label className="text-xs text-slate uppercase tracking-wide block mb-1">Ihr Name (optional)</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="z.B. Maria M."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"/>
            </div>

            {/* Yorum */}
            <div>
              <label className="text-xs text-slate uppercase tracking-wide block mb-1">Kommentar (optional)</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                rows={3} placeholder="Was hat Ihnen besonders gefallen…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent resize-none"/>
            </div>

            <button type="submit" disabled={!rating || state === "loading"}
              className="w-full bg-accent hover:bg-accentdark disabled:opacity-40 text-white font-medium py-3 rounded-xl transition-colors">
              {state === "loading" ? "Wird gespeichert…" : "Bewertung absenden"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function BewertenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"/>
    </div>}>
      <BewertenForm />
    </Suspense>
  );
}

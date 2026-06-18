"use client";
import { useEffect, useRef } from "react";

export default function SalonMap({ salons }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (instanceRef.current) {
      instanceRef.current.remove();
      instanceRef.current = null;
    }

    // Leaflet CSS'i dinamik olarak yükle
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then(L => {
      const Leaflet = L.default || L;

      // Default ikon düzelt (Next.js webpack sorunu)
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Koordinatlı salonları filtrele
      const located = salons.filter(s => s.latitude && s.longitude);
      if (located.length === 0 || !mapRef.current) return;

      const center = [
        located.reduce((s, x) => s + Number(x.latitude), 0) / located.length,
        located.reduce((s, x) => s + Number(x.longitude), 0) / located.length,
      ];

      const map = Leaflet.map(mapRef.current).setView(center, 7);
      instanceRef.current = map;

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      located.forEach(s => {
        const termin_url = s.live_url ? `${s.live_url.replace(/\/$/, "")}/termin` : "#";
        const popup = `
          <div style="min-width:160px">
            <b style="font-size:14px">${s.salon_name}</b><br/>
            <span style="font-size:11px;color:#6b7280">${s.address || s.city || ""}</span><br/>
            <a href="${termin_url}" target="_blank"
              style="display:inline-block;margin-top:8px;background:#ff6b35;color:#fff;padding:4px 10px;border-radius:8px;font-size:12px;text-decoration:none">
              Termin buchen
            </a>
          </div>`;
        Leaflet.marker([Number(s.latitude), Number(s.longitude)])
          .bindPopup(popup)
          .addTo(map);
      });
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [salons]);

  return <div ref={mapRef} style={{ height: "420px", width: "100%", borderRadius: "16px", zIndex: 0 }} />;
}

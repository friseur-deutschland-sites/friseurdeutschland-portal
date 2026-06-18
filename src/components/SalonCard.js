import { StarDisplay } from "./StarRating";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%23f3f4f6'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d1d5db' font-size='60'%3E%E2%9C%82%3C/text%3E%3C/svg%3E";

export default function SalonCard({ salon }) {
  const { salon_name, city, address, logo_url, cover_photo_url, live_url, avg_rating, review_count } = salon;
  const img = cover_photo_url || PLACEHOLDER;
  const termin_url = live_url ? `${live_url.replace(/\/$/, "")}/termin` : "#";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col">
      {/* Kapak */}
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        <img src={img} alt={salon_name} className="w-full h-full object-cover"/>
        {logo_url && (
          <div className="absolute top-3 left-3 bg-white rounded-lg p-1.5 shadow">
            <img src={logo_url} alt="Logo" className="h-7 w-auto max-w-[72px] object-contain"/>
          </div>
        )}
        {city && (
          <span className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
            {city}
          </span>
        )}
      </div>

      {/* İçerik */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-display text-lg font-semibold text-ink leading-tight">{salon_name}</h3>
        {address && <p className="text-slate text-xs truncate">{address}</p>}

        {review_count > 0
          ? <StarDisplay rating={avg_rating} count={review_count} />
          : <span className="text-[11px] text-slate/40">Noch keine Bewertungen</span>
        }

        <div className="mt-auto flex flex-col gap-1.5 pt-2">
          <a href={termin_url} target="_blank" rel="noopener"
            className="block text-center bg-accent hover:bg-accentdark text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
            Termin buchen →
          </a>
          {live_url && (
            <a href={live_url} target="_blank" rel="noopener"
              className="block text-center text-slate text-xs py-1 hover:text-ink transition-colors">
              Website ansehen
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

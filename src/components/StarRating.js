export function StarDisplay({ rating, count }) {
  const r = Number(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1l1.5 3.5 3.5.5-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1z"
            fill={i <= Math.round(r) ? "#ff6b35" : "none"}
            stroke="#ff6b35" strokeWidth="1" strokeLinejoin="round"/>
        </svg>
      ))}
      {count !== undefined && (
        <span className="text-xs text-slate ml-1">({count})</span>
      )}
    </div>
  );
}

export function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)}
          className="transition-transform hover:scale-110 focus:outline-none">
          <svg width="40" height="40" viewBox="0 0 14 14" fill="none">
            <path d="M7 1l1.5 3.5 3.5.5-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1z"
              fill={i <= value ? "#ff6b35" : "none"}
              stroke={i <= value ? "#ff6b35" : "#d1d5db"} strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

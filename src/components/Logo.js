export default function Logo({ size = 40, showText = true }) {
  const r = size;
  const total = showText ? r + 200 : r;

  return (
    <svg width={total} height={r} viewBox={`0 0 ${total} ${r}`} xmlns="http://www.w3.org/2000/svg" aria-label="FriseurDeutschland">
      {/* Icon background */}
      <rect x="0" y="0" width={r} height={r} rx={r * 0.22} fill="#ff6b35"/>

      {/* Scissors icon */}
      {/* Left blade */}
      <line x1={r*0.28} y1={r*0.22} x2={r*0.72} y2={r*0.78} stroke="#fff" strokeWidth={r*0.09} strokeLinecap="round"/>
      {/* Right blade */}
      <line x1={r*0.72} y1={r*0.22} x2={r*0.28} y2={r*0.78} stroke="#fff" strokeWidth={r*0.09} strokeLinecap="round"/>
      {/* Left handle circle */}
      <circle cx={r*0.25} cy={r*0.78} r={r*0.13} fill="none" stroke="#fff" strokeWidth={r*0.075}/>
      {/* Right handle circle */}
      <circle cx={r*0.75} cy={r*0.78} r={r*0.13} fill="none" stroke="#fff" strokeWidth={r*0.075}/>
      {/* Screw center */}
      <circle cx={r*0.5} cy={r*0.5} r={r*0.06} fill="#ff6b35" stroke="#fff" strokeWidth={r*0.04}/>

      {showText && (
        <>
          <text x={r + 14} y={r * 0.38}
            fontFamily="'Inter', sans-serif" fontSize={r * 0.22}
            fontWeight="400" fill="#888" letterSpacing="2">
            FRISEUR
          </text>
          <text x={r + 13} y={r * 0.8}
            fontFamily="'Poppins', 'Inter', sans-serif" fontSize={r * 0.42}
            fontWeight="700" fill="#1a1f2b" letterSpacing="-0.3">
            Deutschland
          </text>
          <circle cx={r + 12} cy={r * 0.9} r={r * 0.06} fill="#ff6b35"/>
        </>
      )}
    </svg>
  );
}

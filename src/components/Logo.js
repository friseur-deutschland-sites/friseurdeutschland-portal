export default function Logo({ size = 40, showText = true }) {
  const r = size;
  const textW = showText ? r * 5.0 : 0;
  const total = r + textW;

  return (
    <svg
      width={total} height={r}
      viewBox={`0 0 ${total} ${r}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FriseurDeutschland"
    >
      {/* Orange rounded square */}
      <rect x="0" y="0" width={r} height={r} rx={r * 0.22} fill="#ff6b35"/>

      {/* Scissors — right blade: upper-right tip → lower-left handle */}
      <line
        x1={r * 0.74} y1={r * 0.15}
        x2={r * 0.30} y2={r * 0.74}
        stroke="#fff" strokeWidth={r * 0.092} strokeLinecap="round"
      />
      {/* Scissors — left blade: upper-left tip → lower-right handle */}
      <line
        x1={r * 0.26} y1={r * 0.15}
        x2={r * 0.70} y2={r * 0.74}
        stroke="#fff" strokeWidth={r * 0.092} strokeLinecap="round"
      />
      {/* Left handle ring */}
      <circle cx={r * 0.30} cy={r * 0.82} r={r * 0.12} fill="#ff6b35" stroke="#fff" strokeWidth={r * 0.072}/>
      {/* Right handle ring */}
      <circle cx={r * 0.70} cy={r * 0.82} r={r * 0.12} fill="#ff6b35" stroke="#fff" strokeWidth={r * 0.072}/>
      {/* Center pivot */}
      <circle cx={r * 0.50} cy={r * 0.46} r={r * 0.065} fill="#ff6b35" stroke="#fff" strokeWidth={r * 0.045}/>

      {showText && (
        <>
          {/* FRISEUR label */}
          <text
            x={r * 1.32} y={r * 0.42}
            fontFamily="'Inter', 'Helvetica Neue', sans-serif"
            fontSize={r * 0.235} fontWeight="400"
            fill="#888" letterSpacing={r * 0.065}
          >
            FRISEUR
          </text>
          {/* Orange dot */}
          <circle cx={r * 1.32} cy={r * 0.77} r={r * 0.062} fill="#ff6b35"/>
          {/* Deutschland */}
          <text
            x={r * 1.47} y={r * 0.83}
            fontFamily="'Poppins', 'Inter', 'Helvetica Neue', sans-serif"
            fontSize={r * 0.445} fontWeight="700"
            fill="#1a1f2b" letterSpacing={r * -0.008}
          >
            Deutschland
          </text>
        </>
      )}
    </svg>
  );
}

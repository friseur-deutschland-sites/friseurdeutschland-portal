import { BRAND, IS_NAGELSTUDIO } from "../lib/brand";

/** Turuncu kare içindeki ikon: friseur = makas, nagelstudio = oje şişesi. */
function ScissorsIcon({ r }) {
  return (
    <>
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
    </>
  );
}

function NailPolishIcon({ r }) {
  return (
    <>
      {/* Kapak */}
      <rect x={r * 0.40} y={r * 0.12} width={r * 0.20} height={r * 0.22} rx={r * 0.04}
        fill="none" stroke="#fff" strokeWidth={r * 0.07}/>
      {/* Şişe gövdesi */}
      <path
        d={`M ${r * 0.34} ${r * 0.42}
            L ${r * 0.66} ${r * 0.42}
            Q ${r * 0.74} ${r * 0.46} ${r * 0.74} ${r * 0.58}
            L ${r * 0.74} ${r * 0.78}
            Q ${r * 0.74} ${r * 0.86} ${r * 0.66} ${r * 0.86}
            L ${r * 0.34} ${r * 0.86}
            Q ${r * 0.26} ${r * 0.86} ${r * 0.26} ${r * 0.78}
            L ${r * 0.26} ${r * 0.58}
            Q ${r * 0.26} ${r * 0.46} ${r * 0.34} ${r * 0.42} Z`}
        fill="none" stroke="#fff" strokeWidth={r * 0.07} strokeLinejoin="round"
      />
      {/* Oje damlası / parlama */}
      <circle cx={r * 0.42} cy={r * 0.62} r={r * 0.055} fill="#fff"/>
    </>
  );
}

export default function Logo({ size = 40, showText = true }) {
  const r = size;
  const textW = showText ? r * (IS_NAGELSTUDIO ? 5.6 : 5.0) : 0;
  const total = r + textW;

  return (
    <svg
      width={total} height={r}
      viewBox={`0 0 ${total} ${r}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={BRAND.siteName}
    >
      {/* Orange rounded square */}
      <rect x="0" y="0" width={r} height={r} rx={r * 0.22} fill="#ff6b35"/>

      {IS_NAGELSTUDIO ? <NailPolishIcon r={r} /> : <ScissorsIcon r={r} />}

      {showText && (
        <>
          {/* Üst küçük etiket (FRISEUR / NAGELSTUDIO) */}
          <text
            x={r * 1.32} y={r * 0.42}
            fontFamily="'Inter', 'Helvetica Neue', sans-serif"
            fontSize={r * (IS_NAGELSTUDIO ? 0.20 : 0.235)} fontWeight="400"
            fill="#888" letterSpacing={r * (IS_NAGELSTUDIO ? 0.045 : 0.065)}
          >
            {BRAND.logoSmall}
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
            {BRAND.logoBig}
          </text>
        </>
      )}
    </svg>
  );
}

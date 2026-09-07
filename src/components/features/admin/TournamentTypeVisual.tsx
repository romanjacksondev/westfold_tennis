import React from 'react';

export const RoundRobinVisual = () => (
  <svg
    viewBox="0 0 120 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    aria-label="Formato Round Robin: todos contra todos y tabla de posiciones"
  >
    {/* Left section: All-play-all matchup network */}
    {/* Diagonals */}
    <line x1="17" y1="17" x2="39" y2="49" stroke="#cbd7d0" strokeWidth="1.2" strokeDasharray="2 2" />
    <line x1="39" y1="17" x2="17" y2="49" stroke="#cbd7d0" strokeWidth="1.2" strokeDasharray="2 2" />
    {/* Perimeter */}
    <line x1="17" y1="17" x2="39" y2="17" stroke="#31745d" strokeWidth="1.5" />
    <line x1="39" y1="17" x2="39" y2="49" stroke="#31745d" strokeWidth="1.5" />
    <line x1="39" y1="49" x2="17" y2="49" stroke="#31745d" strokeWidth="1.5" />
    <line x1="17" y1="49" x2="17" y2="17" stroke="#31745d" strokeWidth="1.5" />

    {/* Match dots on lines */}
    <circle cx="28" cy="17" r="1.8" fill="#e7795b" />
    <circle cx="39" cy="33" r="1.8" fill="#e7795b" />
    <circle cx="28" cy="49" r="1.8" fill="#e7795b" />
    <circle cx="17" cy="33" r="1.8" fill="#e7795b" />

    {/* Center cycle badge */}
    <circle cx="28" cy="33" r="5.5" fill="#f0f5f2" stroke="#cad8d0" strokeWidth="0.8" />
    <path
      d="M26.5 31.5 A2.5 2.5 0 1 1 29.5 35"
      stroke="#31745d"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
    <polygon points="30,30.5 32,32 30,33.5" fill="#31745d" />

    {/* Player nodes */}
    <circle cx="17" cy="17" r="4.5" fill="#183b32" />
    <text x="17" y="19.2" fill="#fff" fontSize="5.5" fontWeight="bold" textAnchor="middle">1</text>

    <circle cx="39" cy="17" r="4.5" fill="#183b32" />
    <text x="39" y="19.2" fill="#fff" fontSize="5.5" fontWeight="bold" textAnchor="middle">2</text>

    <circle cx="39" cy="49" r="4.5" fill="#183b32" />
    <text x="39" y="51.2" fill="#fff" fontSize="5.5" fontWeight="bold" textAnchor="middle">3</text>

    <circle cx="17" cy="49" r="4.5" fill="#183b32" />
    <text x="17" y="51.2" fill="#fff" fontSize="5.5" fontWeight="bold" textAnchor="middle">4</text>

    <text x="28" y="63" fill="#68756f" fontSize="5" fontWeight="700" textAnchor="middle" letterSpacing="0.04em">TODOS VS TODOS</text>

    {/* Transition arrow to table */}
    <path d="M47 33 L52 33" stroke="#9bb8aa" strokeWidth="1.5" strokeLinecap="round" />
    <polygon points="52,31 55,33 52,35" fill="#9bb8aa" />

    {/* Right section: League Standings Table */}
    <rect x="58" y="9" width="56" height="53" rx="4" fill="#ffffff" stroke="#cad8d0" strokeWidth="1" />
    {/* Table Header */}
    <path d="M58 13 C58 10.8 59.8 9 62 9 L110 9 C112.2 9 114 10.8 114 13 L114 20 L58 20 Z" fill="#eaf2ee" />
    <text x="86" y="17" fill="#183b32" fontSize="5.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.08em">TABLA FINAL</text>

    {/* Row 1 (Leader / 1st place) */}
    <rect x="61" y="23" width="6.5" height="6" rx="1.5" fill="#e7795b" />
    <text x="64.2" y="27.5" fill="#fff" fontSize="5" fontWeight="bold" textAnchor="middle">1</text>
    <rect x="71" y="25" width="28" height="2.8" rx="1.4" fill="#183b32" />
    <circle cx="104" cy="26.4" r="1.4" fill="#31745d" />
    <circle cx="108" cy="26.4" r="1.4" fill="#31745d" />

    {/* Row 2 */}
    <rect x="61" y="32" width="6.5" height="6" rx="1.5" fill="#31745d" />
    <text x="64.2" y="36.5" fill="#fff" fontSize="5" fontWeight="bold" textAnchor="middle">2</text>
    <rect x="71" y="34" width="24" height="2.8" rx="1.4" fill="#68756f" />
    <circle cx="104" cy="35.4" r="1.4" fill="#31745d" />
    <circle cx="108" cy="35.4" r="1.4" fill="#cad8d0" />

    {/* Row 3 */}
    <rect x="61" y="41" width="6.5" height="6" rx="1.5" fill="#e9eee9" />
    <text x="64.2" y="45.5" fill="#68756f" fontSize="5" fontWeight="bold" textAnchor="middle">3</text>
    <rect x="71" y="43" width="19" height="2.8" rx="1.4" fill="#cbd7d0" />
    <circle cx="104" cy="44.4" r="1.4" fill="#cad8d0" />
    <circle cx="108" cy="44.4" r="1.4" fill="#cad8d0" />

    {/* Row 4 */}
    <rect x="61" y="50" width="6.5" height="6" rx="1.5" fill="#e9eee9" />
    <text x="64.2" y="54.5" fill="#68756f" fontSize="5" fontWeight="bold" textAnchor="middle">4</text>
    <rect x="71" y="52" width="15" height="2.8" rx="1.4" fill="#cbd7d0" />
    <circle cx="104" cy="53.4" r="1.4" fill="#cad8d0" />
    <circle cx="108" cy="53.4" r="1.4" fill="#cad8d0" />
  </svg>
);

export const RoundRobinPlayoffsVisual = () => (
  <svg
    viewBox="0 0 120 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    aria-label="Formato Round Robin + Playoffs: fase de grupos y llave final"
  >
    {/* Left: Group stage table */}
    <rect x="6" y="9" width="41" height="52" rx="4" fill="#ffffff" stroke="#cad8d0" strokeWidth="1" />
    <path d="M6 13 C6 10.8 7.8 9 10 9 L43 9 C45.2 9 47 10.8 47 13 L47 19 L6 19 Z" fill="#eaf2ee" />
    <text x="26.5" y="16.2" fill="#183b32" fontSize="5.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.08em">GRUPO</text>

    {/* Highlight box around top 2 qualifiers */}
    <rect x="8" y="21" width="37" height="19" rx="2" fill="#f2f7f4" stroke="#55a878" strokeWidth="0.8" strokeDasharray="2 1.5" />

    {/* Row 1 (Qualified 1) */}
    <rect x="10" y="23" width="6" height="5.5" rx="1" fill="#31745d" />
    <text x="13" y="27.2" fill="#fff" fontSize="4.5" fontWeight="bold" textAnchor="middle">1</text>
    <rect x="18" y="25" width="18" height="2.2" rx="1.1" fill="#183b32" />
    <circle cx="40" cy="26" r="1.4" fill="#55a878" />

    {/* Row 2 (Qualified 2) */}
    <rect x="10" y="31.5" width="6" height="5.5" rx="1" fill="#31745d" />
    <text x="13" y="35.7" fill="#fff" fontSize="4.5" fontWeight="bold" textAnchor="middle">2</text>
    <rect x="18" y="33.5" width="18" height="2.2" rx="1.1" fill="#183b32" />
    <circle cx="40" cy="34.5" r="1.4" fill="#55a878" />

    {/* Row 3 */}
    <rect x="10" y="42" width="6" height="5" rx="1" fill="#e9eee9" />
    <text x="13" y="45.8" fill="#87928c" fontSize="4.5" fontWeight="bold" textAnchor="middle">3</text>
    <rect x="18" y="43.5" width="15" height="2" rx="1" fill="#cad8d0" />

    {/* Row 4 */}
    <rect x="10" y="49.5" width="6" height="5" rx="1" fill="#e9eee9" />
    <text x="13" y="53.3" fill="#87928c" fontSize="4.5" fontWeight="bold" textAnchor="middle">4</text>
    <rect x="18" y="51" width="12" height="2" rx="1" fill="#cad8d0" />

    <text x="26.5" y="67" fill="#31745d" fontSize="4.8" fontWeight="700" textAnchor="middle">2 CLASIFICAN</text>

    {/* Flow Arrows from Qualifiers to Playoff tree */}
    <path d="M47 26 C 53 26, 54 22, 60 22" stroke="#e7795b" strokeWidth="1.5" fill="none" />
    <polygon points="60,20 63,22 60,24" fill="#e7795b" />

    <path d="M47 35 C 53 35, 54 48, 60 48" stroke="#e7795b" strokeWidth="1.5" fill="none" />
    <polygon points="60,46 63,48 60,50" fill="#e7795b" />

    {/* Right: Playoff Bracket */}
    <text x="82" y="12" fill="#68756f" fontSize="5.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.06em">PLAYOFFS</text>

    {/* Semifinal lines */}
    <line x1="63" y1="22" x2="78" y2="22" stroke="#31745d" strokeWidth="2" strokeLinecap="round" />
    <line x1="63" y1="48" x2="78" y2="48" stroke="#31745d" strokeWidth="2" strokeLinecap="round" />

    {/* Bracket vertical connector */}
    <path d="M78 22 L78 48" stroke="#31745d" strokeWidth="1.8" strokeLinejoin="round" />

    {/* Horizontal branch to Final */}
    <line x1="78" y1="35" x2="94" y2="35" stroke="#e7795b" strokeWidth="2.2" strokeLinecap="round" />

    {/* Trophy / Champion */}
    <g transform="translate(98, 24)">
      <path d="M3 5 C3 12, 11 12, 11 5 Z" fill="#e7795b" />
      <path d="M3 6 C1 6, 1 9, 3 9" stroke="#e7795b" strokeWidth="1" fill="none" />
      <path d="M11 6 C13 6, 13 9, 11 9" stroke="#e7795b" strokeWidth="1" fill="none" />
      <rect x="6" y="12" width="2" height="3" fill="#e7795b" />
      <rect x="4" y="15" width="6" height="2" rx="0.5" fill="#183b32" />
      <polygon points="7,0.5 8,3 10.5,3 8.5,4.5 9.5,7 7,5.5 4.5,7 5.5,4.5 3.5,3 6,3" fill="#e7795b" />
    </g>
  </svg>
);

export const PlayoffsVisual = () => (
  <svg
    viewBox="0 0 120 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    aria-label="Formato Playoffs: eliminación directa llave semifinales y final"
  >
    {/* Round Headers */}
    <text x="21" y="9" fill="#68756f" fontSize="5.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.06em">SEMIS</text>
    <text x="61" y="9" fill="#68756f" fontSize="5.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.06em">FINAL</text>
    <text x="102" y="9" fill="#e7795b" fontSize="5.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.06em">CAMPEÓN</text>

    {/* --- Semifinal 1 (Top Match) --- */}
    <line x1="8" y1="16" x2="30" y2="16" stroke="#183b32" strokeWidth="2" strokeLinecap="round" />
    <circle cx="10" cy="16" r="1.5" fill="#e7795b" />
    <line x1="8" y1="26" x2="30" y2="26" stroke="#87928c" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10" cy="26" r="1.5" fill="#cad8d0" />
    {/* Bracket 1 */}
    <path d="M30 16 L36 16 L36 26 L30 26" stroke="#31745d" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <line x1="36" y1="21" x2="55" y2="21" stroke="#31745d" strokeWidth="2.2" strokeLinecap="round" />

    {/* --- Semifinal 2 (Bottom Match) --- */}
    <line x1="8" y1="44" x2="30" y2="44" stroke="#183b32" strokeWidth="2" strokeLinecap="round" />
    <circle cx="10" cy="44" r="1.5" fill="#e7795b" />
    <line x1="8" y1="54" x2="30" y2="54" stroke="#87928c" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10" cy="54" r="1.5" fill="#cad8d0" />
    {/* Bracket 2 */}
    <path d="M30 44 L36 44 L36 54 L30 54" stroke="#31745d" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <line x1="36" y1="49" x2="55" y2="49" stroke="#31745d" strokeWidth="2.2" strokeLinecap="round" />

    {/* --- Final Match --- */}
    <line x1="55" y1="21" x2="72" y2="21" stroke="#183b32" strokeWidth="2" strokeLinecap="round" />
    <line x1="55" y1="49" x2="72" y2="49" stroke="#183b32" strokeWidth="2" strokeLinecap="round" />
    {/* Final bracket */}
    <path d="M72 21 L79 21 L79 49 L72 49" stroke="#183b32" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    {/* Champion branch */}
    <line x1="79" y1="35" x2="93" y2="35" stroke="#e7795b" strokeWidth="2.5" strokeLinecap="round" />

    {/* --- Trophy & Champion Badge --- */}
    <g transform="translate(97, 24)">
      <path d="M3 5 C3 12, 11 12, 11 5 Z" fill="#e7795b" />
      <path d="M3 6 C1 6, 1 9, 3 9" stroke="#e7795b" strokeWidth="1" fill="none" />
      <path d="M11 6 C13 6, 13 9, 11 9" stroke="#e7795b" strokeWidth="1" fill="none" />
      <rect x="6" y="12" width="2" height="3" fill="#e7795b" />
      <rect x="4" y="15" width="6" height="2" rx="0.5" fill="#183b32" />
      <polygon points="7,0.5 8,3 10.5,3 8.5,4.5 9.5,7 7,5.5 4.5,7 5.5,4.5 3.5,3 6,3" fill="#e7795b" />
    </g>

    <text x="50" y="66" fill="#87928c" fontSize="4.8" fontWeight="600" textAnchor="middle">ELIMINACIÓN DIRECTA</text>
  </svg>
);

interface TournamentTypeVisualProps {
  typeName: string;
}

export const TournamentTypeVisual: React.FC<TournamentTypeVisualProps> = ({ typeName }) => {
  const normalized = typeName.trim().toLowerCase();

  if (normalized.includes('round robin') && normalized.includes('playoff')) {
    return <RoundRobinPlayoffsVisual />;
  }

  if (normalized.includes('round robin')) {
    return <RoundRobinVisual />;
  }

  if (normalized.includes('playoff')) {
    return <PlayoffsVisual />;
  }

  return <PlayoffsVisual />;
};

export default TournamentTypeVisual;


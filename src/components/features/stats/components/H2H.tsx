'use client';

import { useState } from 'react';
import { LuArrowRightLeft, LuHistory, LuSwords, LuUsers } from 'react-icons/lu';

export interface H2HRecord {
  won: Record<string, number>;
  lost: Record<string, number>;
}

interface H2HProps {
  h2h?: Record<string, H2HRecord>;
  onNavigateToHistory?: (player1Name: string, player2Name: string) => void;
}

const H2H = ({ h2h = {}, onNavigateToHistory }: H2HProps) => {
  const jugadores = Object.keys(h2h).sort();

  const [playerA, setPlayerA] = useState<string>(() => jugadores[0] || '');
  const [playerB, setPlayerB] = useState<string>(() => (jugadores.length > 1 ? jugadores[1] : jugadores[0] || ''));

  if (!h2h || jugadores.length === 0) {
    return (
      <div className="empty-state">
        <LuUsers className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p>No hay datos de enfrentamientos disponibles en este momento.</p>
      </div>
    );
  }

  // Current comparator stats
  const activeA = playerA && jugadores.includes(playerA) ? playerA : jugadores[0];
  const activeB = playerB && jugadores.includes(playerB) && playerB !== activeA ? playerB : (jugadores.find((j) => j !== activeA) || jugadores[0]);

  const winsA = h2h[activeA]?.won?.[activeB] || 0;
  const winsB = h2h[activeA]?.lost?.[activeB] || 0;
  const totalH2HMatches = winsA + winsB;

  const pctA = totalH2HMatches > 0 ? Math.round((winsA / totalH2HMatches) * 100) : 50;
  const pctB = totalH2HMatches > 0 ? 100 - pctA : 50;

  const handleSwap = () => {
    setPlayerA(activeB);
    setPlayerB(activeA);
  };

  const handleCellClick = (p1: string, p2: string) => {
    if (p1 === p2) return;
    setPlayerA(p1);
    setPlayerB(p2);
  };

  return (
    <div className="stats-h2h-container">
      {/* ─── Matchup Comparator Card ────────────────────────────────────────── */}
      <div className="stats-comparator-card">
        <div className="stats-comparator-header">
          <span className="eyebrow flex items-center gap-1.5">
            <LuSwords className="w-3.5 h-3.5 text-[#d66e52]" />
            Comparador Directo
          </span>
          <span className="stats-total-pill">
            {totalH2HMatches} {totalH2HMatches === 1 ? 'partido disputado' : 'partidos disputados'}
          </span>
        </div>

        <div className="stats-comparator-body">
          {/* Player A Column */}
          <div className="stats-comparator-player">
            <label htmlFor="select-player-a" className="sr-only">Jugador A</label>
            <select
              id="select-player-a"
              value={activeA}
              onChange={(e) => setPlayerA(e.target.value)}
              className="stats-player-select"
            >
              {jugadores.map((j) => (
                <option key={j} value={j} disabled={j === activeB}>
                  {j}
                </option>
              ))}
            </select>
            <div className={`stats-comparator-score ${winsA > winsB ? 'is-winning' : winsA < winsB ? 'is-losing' : ''}`}>
              {winsA}
            </div>
            <span className="stats-score-subtext">Victorias ({pctA}%)</span>
          </div>

          {/* VS Divider & Controls */}
          <div className="stats-comparator-mid">
            <span className="stats-vs-badge">VS</span>
            <button
              type="button"
              onClick={handleSwap}
              className="stats-swap-btn"
              title="Invertir jugadores"
              aria-label="Invertir jugadores"
            >
              <LuArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Player B Column */}
          <div className="stats-comparator-player">
            <label htmlFor="select-player-b" className="sr-only">Jugador B</label>
            <select
              id="select-player-b"
              value={activeB}
              onChange={(e) => setPlayerB(e.target.value)}
              className="stats-player-select"
            >
              {jugadores.map((j) => (
                <option key={j} value={j} disabled={j === activeA}>
                  {j}
                </option>
              ))}
            </select>
            <div className={`stats-comparator-score ${winsB > winsA ? 'is-winning' : winsB < winsA ? 'is-losing' : ''}`}>
              {winsB}
            </div>
            <span className="stats-score-subtext">Victorias ({pctB}%)</span>
          </div>
        </div>

        {/* Win Bar Indicator */}
        {totalH2HMatches > 0 && (
          <div className="stats-bar-container">
            <div
              className="stats-bar-left"
              style={{ width: `${pctA}%` }}
              title={`${activeA}: ${pctA}%`}
            />
            <div
              className="stats-bar-right"
              style={{ width: `${pctB}%` }}
              title={`${activeB}: ${pctB}%`}
            />
          </div>
        )}

        {onNavigateToHistory && totalH2HMatches > 0 && (
          <div className="stats-comparator-footer">
            <button
              type="button"
              onClick={() => onNavigateToHistory(activeA, activeB)}
              className="stats-view-history-btn"
            >
              <LuHistory className="w-4 h-4" />
              Ver partidos entre {activeA} y {activeB} en el Historial
            </button>
          </div>
        )}
      </div>

      {/* ─── H2H Cross Matrix Table ────────────────────────────────────────── */}
      <div className="stats-matrix-wrap">
        <div className="stats-matrix-header">
          <div>
            <p className="eyebrow">Matriz Histórica</p>
            <h3 className="stats-matrix-title">Frente a Frente Completo</h3>
          </div>
          <span className="stats-matrix-hint">
            Haz clic en cualquier celda para cargar el enfrentamiento en el comparador.
          </span>
        </div>

        <div className="table-responsive-wrapper">
          <table className="stats-matrix-table">
            <thead>
              <tr>
                <th className="stats-matrix-corner">Jugador</th>
                {jugadores.map((col) => (
                  <th key={col} className={`stats-matrix-col-header ${col === activeB ? 'is-active-col' : ''}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jugadores.map((row) => (
                <tr key={row} className={row === activeA ? 'is-active-row' : ''}>
                  <td className="stats-matrix-row-header">
                    <strong>{row}</strong>
                  </td>
                  {jugadores.map((col) => {
                    if (row === col) {
                      return (
                        <td key={col} className="stats-matrix-cell-same">
                          <span>—</span>
                        </td>
                      );
                    }

                    const w = h2h[row]?.won?.[col] || 0;
                    const l = h2h[row]?.lost?.[col] || 0;
                    const isCurrentPair = (row === activeA && col === activeB) || (row === activeB && col === activeA);

                    let badgeClass = 'stats-h2h-badge-tied';
                    if (w > l) badgeClass = 'stats-h2h-badge-win';
                    else if (w < l) badgeClass = 'stats-h2h-badge-loss';

                    return (
                      <td
                        key={col}
                        className={`stats-matrix-cell ${isCurrentPair ? 'is-selected-cell' : ''}`}
                        onClick={() => handleCellClick(row, col)}
                        title={`${row}: ${w} victoria(s) y ${l} derrota(s) contra ${col}`}
                      >
                        <span className={`stats-h2h-badge ${badgeClass}`}>
                          {w} - {l}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default H2H;
